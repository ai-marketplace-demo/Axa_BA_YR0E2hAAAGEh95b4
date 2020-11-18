import React, {useState, useEffect} from "react";
import {Container, Row, Col, Spinner, Form, Button} from "react-bootstrap";
import {Link, useHistory} from "react-router-dom";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import useClient from "../../api/client";
import { Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {toast} from"react-toastify"
import createRedshiftCluster from "../../api/RedshiftCluster/createCluster";
import importRedshiftCluster from "../../api/RedshiftCluster/importCluster";
import {If, Then} from "react-if";
import Select from "react-select";
import listOrganizationEnvironments from "../../api/Environment/listOrganizationEnvironments";
import {getRegionLabel} from "../../components/AwsRegions/AwsRegionSelect";
import listOrganizations from "../../api/Organization/listOrganizations";



const Background=styled.div`
margin-top: -0px;
margin-right: 5px;
z-index: 10;
border-radius: 0px;
background-color: white;
border : 1px solid lightgrey;
border-left:  4px solid lightcoral;
overflow-y:auto;
overflow-x: hidden;

box-shadow: 0px 1px 2px 2px whitesmoke;
padding: 16px;
.form-group {
    margin-bottom: 1.6em;
  }
.error {
    border: 2px solid #FF6565;
  }
.error-message {
color: #FF6565;
padding: .5em .2em;
height: 1em;
position: absolute;
font-size: .8em;
}
`


const ImportCluster= (props)=>{
    let history = useHistory();
    let client=useClient();
    let [submitting, setSubmitting] = useState(false);
    let [isSingleNode, setSingleNode] = useState(true);
    let [orgs,setOrgs] = useState([])
    let [envs, setEnvs] = useState([]);
    let [formData, setFormData]=useState({
        label: "",
        clusterIdentifier: "",
        env: {},
        org:{},
        tags:[]
    });
    const selectOrg=async (selectOption)=>{
        setFormData({...formData, org:selectOption});
        const res = await client.query(listOrganizationEnvironments({organizationUri:selectOption.value}));
        if (!res.errors){
            setEnvs(res.data.getOrganization.environments.nodes.map((e)=>{
                return {label : e.label, value:e.environmentUri, region:{label:getRegionLabel(e.region),value:e.region}}
            }))
        }
    };
    const selectEnv= (selectOption)=>{
        setFormData({...formData, env: selectOption});
    }
    const validationSchema = Yup.object().shape({
        label: Yup.string()
            .min(2, "*Cluster name must have at least 2 characters")
            .max(63, "*Cluster name can't be longer than 63 characters")
            .required("*Cluster name is required")
    });
    useEffect(()=>{
        if (client){
            client
                .query(listOrganizations({filter:{roles:['Admin','Member','Owner']}}))
                .then((res)=>{
                    setOrgs(res.data.listOrganizations.nodes.map((org)=>{
                        return {label : org.label+` (${org.organizationUri})`,value:org.organizationUri}
                    }));
                })
        }
    },[client]);


    const submitForm=async (formData)=>{
        setSubmitting(true);
        const environmentUri = formData.env.value;
        delete formData.env;
        delete formData.org;
        const response = await client.mutate(importRedshiftCluster({
            environmentUri : environmentUri,
            input:formData
        }));
        setSubmitting(false);
        if (!response.errors){
            toast(`Imported Amazon Redshift cluster`,{
                hideProgressBar:true,
                onClose:()=>{history.goBack()}
            })
        }
        else {
            toast.error(`Could not import Amazon Redshift cluster!, 
            ${response.errors[0].message}`)
        }
    };

    return <Container>
        <Row>
            <Col xs={12}>
                <h4>
                    <Link
                        to={{
                            pathname: `/redshiftclusters`
                        }}
                        style={{color: 'black'}}>
                        <Icon.ChevronLeft size={32}/>
                    </Link>
                    <Icon.Server xs={48} className={'ml-3'}/>
                    <span className={'ml-2'}>Import Amazon Redshift Cluster</span>
                </h4>
            </Col>
            <Col xs={12}>
                <If condition={submitting}>
                    <Then>
                        <Spinner variant={'primary'} animation={`border`}/>
                    </Then>
                </If>
            </Col>
        </Row>
        <Background>
            <Formik
                enableReinitialize
                initialValues={formData}
                validationSchema={validationSchema}
                onSubmit={(formData, {setSubmitting, resetForm}) => {
                    submitForm(formData)
                }}
            >
                {/* Callback function containing Formik state and helpers that handle common form actions */}
                {( {values,
                       errors,
                       touched,
                       handleChange,
                       handleBlur,
                       handleSubmit}) => (

                    <Form onSubmit={handleSubmit} className="mx-auto">
                        {console.log(values)}
                        <Row>
                            <Col xs={2}><b>Settings</b></Col>
                            <Col xs={10}>
                                <Row>

                                    <Col xs={1}><b>Org</b></Col>
                                    <Col xs={3}>
                                        <Select
                                            value={orgs ? orgs.find(option => option.value === values.org) : ''}
                                            onChange={selectOrg}
                                            options={orgs}
                                        />
                                    </Col>
                                    <Col xs={1}><b>Env</b></Col>
                                    <Col xs={3}>
                                        <Select
                                            value={envs ? envs.find(option => option.value === values.env) : ''}
                                            onChange={selectEnv}
                                            options={envs}
                                        />
                                    </Col>
                                    <Col xs={1}><b>Region</b></Col>
                                    <Col xs={3}>
                                        <Select
                                            isDisabled={true}
                                            value={values.env && values.env.region ? values.env.region : ''}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Form.Group controlId="label">
                            <Form.Label><b>Cluster Name</b></Form.Label>
                            <Form.Control
                                type="text"
                                name="label"
                                placeholder="cluster name"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.label}
                                className={touched.label && errors.label ? "error" : null}
                            />
                            {touched.label && errors.label ? (
                                <div className="error-message">{errors.label}</div>
                            ): null}
                        </Form.Group>

                        <Form.Group controlId="label">
                            <Form.Label><b>Amazon Redshift Cluster Identifier</b></Form.Label>
                            <Form.Control
                                type="text"
                                name="clusterIdentifier"
                                placeholder="Cluster identifier from AWS"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.clusterIdentifier}
                                className={touched.clusterIdentifier && errors.clusterIdentifier ? "error" : null}
                            />
                            {touched.label && errors.label ? (
                                <div className="error-message">{errors.label}</div>
                            ): null}
                        </Form.Group>

                        <Row className={"mt-4"}>
                            <Col xs={3}><b></b>

                                <Button variant="success" type="submit" disabled={submitting}>
                                    <b>Create</b>
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </Background>
    </Container>
}

export default ImportCluster;