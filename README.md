## Summary

This repository provides a starter template to help you build your own custom Agent Chat app with a React front end and an GenAI agent backend, built on [strands-agents](https://strandsagents.com/latest/) and running on [AWS AgentCore](https://aws.amazon.com/bedrock/agentcore/). It was forked from [Amplify V2 template](https://docs.amplify.aws/react/start/quickstart/). This application provides the bare bones of an Agent Chat App that can be viewed [here](placeholder).

There is a more enhanced version of this application that uses more Agent capabilities with NFL data. You can see the site [here]() and the code repo [here](). 

## Create the infrastructure

1. Clone the repository to your git repository
2. Login to you aws account and navigate to Amplify
3. Create an application by linking to the cloned repository
4. In advanced settings, create two Environmen Variables:
    * name = AGENTCORE_RUNTIME_ARN, value = PLACEHOLDER (you will add this later)
    * name = NOTIFICATION_EMAIL, value = youremail@example.com
5. Create application

This is going to:

* Create a react app with authentication
    * You will get notifications when users sign-up
* Create a Lambda function to call your agent in agent core (not yet built)
* Add roles for creating your agent core app (done next)


## Build and deploy your AI Agent

PLACE HOLDER

