FROM public.ecr.aws/docker/library/alpine:3.20
RUN apk update && apk add --no-cache bash unzip git openssh
RUN git config --global user.email "hajtex@example.com" && \
    git config --global user.name "HajTeX"
    
WORKDIR /app
COPY worker.sh .
RUN chmod +x worker.sh
CMD ["timeout", "15", "/app/worker.sh"]


