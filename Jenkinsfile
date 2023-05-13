pipeline {
    agent any

    environment {
        gitLabel = VersionNumber([
            projectStartDate: '2023-01-01',
            versionNumberString: "${params.gitLabel}",
            worstResultForIncrement: 'SUCCESS'
        ])
    }

    stages {
        stage('Docker:latest') {
            steps {
                script {
                    currentBuild.displayName = "${params.gitLabel}"
                }
                sh "docker build --build-arg debug_mode=--no-dev -t rmamba/letsproxy:api ."
                sh "docker push rmamba/letsproxy:api"
            }
        }
        stage('Docker:14-alpine') {
            steps {
                sh "docker tag rmamba/letsproxy:api rmamba/letsproxy:14-alpine"
                sh "docker push rmamba/letsproxy:14-alpine"
                sh "docker rmi rmamba/letsproxy:14-alpine"
            }
        }
        stage('Docker:tag') {
            steps {
                sh "docker tag rmamba/letsproxy:api rmamba/letsproxy:14-alpine-${params.gitLabel}"
                sh "docker push rmamba/letsproxy:14-alpine-${params.gitLabel}"
                sh "docker rmi rmamba/letsproxy:14-alpine-${params.gitLabel}"
            }
        }
    }
}
