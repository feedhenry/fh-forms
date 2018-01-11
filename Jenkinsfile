#!groovy

// https://github.com/feedhenry/fh-pipeline-library
@Library('fh-pipeline-library') _

node('nodejs6') {
    step([$class: 'WsCleanup'])

    stage ('Checkout') {
        checkout scm
    }
    
    stage('Install Dependencies') {
        npmInstall {}
    }

    stage('Lint') {
        sh 'grunt eslint'
    }

    stage('Unit Tests') {
            sh 'grunt fh:unit'
    }

    stage('Acceptance Tests') {
        withOpenshiftServices(['mongodb32']) {
            sh 'grunt fh:accept'
        }
    }

    stage('Build') {
        gruntBuild {
            name = 'fh-forms'
        }
    }
}
