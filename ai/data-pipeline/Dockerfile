FROM bde2020/hadoop-base:2.0.0-hadoop3.2.1-java8 AS hadoop-base

FROM python:3.11-slim-bullseye

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-11-jre-headless \
    && rm -rf /var/lib/apt/lists/*

COPY --from=hadoop-base /opt/hadoop-3.2.1 /opt/hadoop-3.2.1

ENV HADOOP_HOME=/opt/hadoop-3.2.1
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
ENV PATH=$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$PATH
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

RUN mkdir -p $HADOOP_CONF_DIR && \
    printf '<?xml version="1.0"?>\n<configuration>\n<property><name>fs.defaultFS</name><value>hdfs://namenode:8020</value></property>\n</configuration>\n' > $HADOOP_CONF_DIR/core-site.xml && \
    printf '<?xml version="1.0"?>\n<configuration>\n<property><name>dfs.replication</name><value>2</value></property>\n<property><name>dfs.permissions.enabled</name><value>false</value></property>\n</configuration>\n' > $HADOOP_CONF_DIR/hdfs-site.xml && \
    printf '<?xml version="1.0"?>\n<configuration>\n<property><name>yarn.resourcemanager.hostname</name><value>resourcemanager</value></property>\n<property><name>yarn.resourcemanager.address</name><value>resourcemanager:8032</value></property>\n<property><name>yarn.resourcemanager.scheduler.address</name><value>resourcemanager:8030</value></property>\n</configuration>\n' > $HADOOP_CONF_DIR/yarn-site.xml

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# PySpark 환경변수
ENV PYSPARK_PYTHON=python3
ENV YARN_CONF_DIR=$HADOOP_CONF_DIR

WORKDIR /app
COPY collect/ /app/collect/
COPY dedup/ /app/dedup/
COPY refine/ /app/refine/
COPY common/ /app/common/
COPY config/ /app/config/

CMD ["tail", "-f", "/dev/null"]