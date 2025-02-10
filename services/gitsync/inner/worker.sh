#!/bin/bash
cd /ops
unzip overleaf.zip git.config
if [ ! -f git.config ]; then
    2>&1 echo "No git.config found"
    exit 1
fi
GIVEN_URL=$(cat git.config | cut -d ';' -f 1 | tr -d '[:space:]')

SSH_KEY_DATA=$(cat git.config | cut -d ';' -f 2 | tr -d '[:space:]')

echo $SSH_KEY_DATA | base64 -d > /app/git_key
echo "" >> /app/git_key
chmod 600 /app/git_key
echo "Cloning"
git clone --progress -c "core.sshCommand=ssh -i /app/git_key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" $(echo $GIVEN_URL) repo 
echo "Cloned"
rm -rf repo/*
unzip -o overleaf.zip -d repo
cd repo
rm -rf git.config
git add .
git commit -m "Update from HajTeX"
worked_push=$(git push origin 2>&1)
echo "Pushed"
rm -rf /ops/*
if [[ $worked_push =~ "fatal" ]]; then
    2>&1 echo "PUSH_GIT_FAILED"
    exit 1
fi
echo "PUSH_GIT_OK"
exit 0