At Brightlystake we are extremely thrilled about the possibilities that comes with decentralised storage @WalrusProtocol  provides.

We have created a tool for the $WAL operators to measure their performance over a period of time. 
```
1. Overall Dashboard, Individual Dashboard (https://walrus.brightlystake.com)
```
Timelines 
        We get the data from /v1/health endpoint every 10 minutes.

Color schemes
    Red highlight - When the node status is not in Active status or event_pending is NA
    Yellow highlight - When the event_pending is > 0
    
Once you click on a particular operator we will take you to the individual dashboard where you can get the performance record for up to a month. 

Here we have the block represention in 3 colors


**  Operator status **
    GREEN - if Active. RED - if not Active. GREY - if NA
    
**  Event Pending **
    GREEN - if 0. YELLOW - if > 0 and < 200. RED - if > 200. GREY - if NA

```
2 . Shards Dashboard (https://walrus.brightlystake.com/shard-owners)
```
The Shards Dashboard has 2 main features. Display which shard is assigned to which operator.

Depending upon how many previous assignment the shard had we highlight in different colors.

The next feature is to provide the historic values of a specific shard. 
You can either search for a shard or click on the shard as shown in the table. 

