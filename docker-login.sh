#!/bin/bash

docker_password_and_login () {
    echo "Grabbing fresh password ..."
    /usr/bin/aws ecr get-login-password --region eu-central-1 --profile rocinante > ~/.aws/926014012638-eu-central-1

    docker_login
}

docker_login () {
    cat ~/.aws/926014012638-eu-central-1 | docker login \
    --username AWS \
    --password-stdin 926014012638.dkr.ecr.eu-central-1.amazonaws.com || return 1
    return 0
}

docker_login || docker_password_and_login
