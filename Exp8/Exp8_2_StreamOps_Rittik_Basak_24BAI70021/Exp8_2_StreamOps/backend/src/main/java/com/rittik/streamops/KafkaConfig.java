package com.rittik.streamops;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.springframework.context.annotation.*;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.*;
import org.springframework.kafka.support.ExponentialBackOffWithMaxRetries;
@Configuration
public class KafkaConfig {
 public static final String MAIN="scheduled-posts-82", DLQ="scheduled-posts-dlq-82";
 @Bean NewTopic mainTopic(){return TopicBuilder.name(MAIN).partitions(1).replicas(1).build();}
 @Bean NewTopic deadLetterTopic(){return TopicBuilder.name(DLQ).partitions(1).replicas(1).build();}
 @Bean DefaultErrorHandler errorHandler(KafkaTemplate<String,String> template){
  var recoverer=new DeadLetterPublishingRecoverer(template,(record,exception)->new TopicPartition(DLQ,record.partition()));
  recoverer.setFailIfSendResultIsError(true);
  var backoff=new ExponentialBackOffWithMaxRetries(3);
  backoff.setInitialInterval(1000L);backoff.setMultiplier(2);backoff.setMaxInterval(4000L);
  return new DefaultErrorHandler(recoverer,backoff);
 }
}
