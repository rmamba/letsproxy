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
            script {
                currentBuild.displayName = "${params.gitLabel}"
            }
            steps {
                sh 'chmod +x docker-login.sh'
                sh './docker-login.sh'
                sh "docker build --build-arg debug_mode=--no-dev -t rmamba/letsproxy:ux ."
                sh "docker push rmamba/letsproxy:ux"
            }
        }
        stage('Docker:tag') {
            steps {
                sh "docker tag rmamba/letsproxy:ux rmamba/letsproxy:${params.gitLabel}"
                sh "docker push rmamba/letsproxy:${params.gitLabel}"
                sh "docker rmi rmamba/letsproxy:${params.gitLabel}"
            }
        }
    }
}
