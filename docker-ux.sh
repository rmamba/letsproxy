#!/bin/bash

gitLabel=`git branch | grep \* | cut -d ' ' -f2`
docker build -t rmamba/letsproxy:$gitLabel .
# docker tag rmamba/letsproxy:$gitLabel rmamba/letsproxy:$gitLabel
# docker push rmamba/letsproxy:$gitLabel
