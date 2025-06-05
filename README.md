## 🧪 Testing /identify Endpoint
# Use curl or Postman to test the API:

1) https://identity-reconciliation-service-1.onrender.com/api/identify

## CURL: 

```curl -X POST https://identity-reconciliation-service-1.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'```



# You should receive a JSON response like:

```{
    "primaryContactId": 2,
    "emails": [
        "mcfly@hillvalley.edu"
    ],
    "phoneNumbers": [
        "123456",
        "919191"
    ],
    "secondaryContactIds": [
        3
    ]
}```

2)

## CURL 

curl -X GET https://identity-reconciliation-service-1.onrender.com/api/contacts

# You should receive a JSON response like:


```[{"primaryContactId":1,"emails":["george@hillvalley.edu"],"phoneNumbers":["717171"],"secondaryContactIds":[]},{"primaryContactId":2,"emails":["mcfly@hillvalley.edu"],"phoneNumbers":["123456","919191"],"secondaryContactIds":[3]},{"primaryContactId":4,"emails":["e00011@gmail.com","e00012@gmail.com","e00013@gmail.com","e00014@gmail.com"],"phoneNumbers":["9000000011","9000000012","9000000013","9000000014"],"secondaryContactIds":[5,6,7]}]```




