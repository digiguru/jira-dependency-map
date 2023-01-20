export const example = {
    
    "total": 1,
    "issues": [
      {
        "key": "WED-5317",
        "fields": {
          "summary": "The first ticket",
          "status": 
          {
            "name": "Ready For Release"
          },
          parent: {fields: {summary: "WED-7305"}},
          "customfield_10004": "13",
          "issuelinks": [
            {
              "outwardIssue": {
                "key": "WED-7039"
              },
              "type": {  
                "name":"Blocks",
              }
            },            
            {
              "inwardIssue": {
                "key": "WED-6962",
              },
              "type": {  
                "name":"Blocks",
              }
            },
            {
              "outwardIssue": {
                "key": "WED-1112",
              },
              "type":{  
                "name":"Relates"
             },
            },
            {
              "inwardIssue": {
                "key": "WED-6960",
              },
              "type":{  
                "name":"Blocks"
              }
            }
          ]
        }
      },
      {
        "key": "WED-7039",
        "fields": {
          parent: {fields: {summary: "WED-7305"}},
          "status":
            {
              "name": "In Test"
            },
          "issuelinks": [
            {
              "inwardIssue": {
                "key": "WED-5317"
              },
              "type":{  
                "name":"Blocks"
              }
            },
            {
              "inwardIssue": {
                "key": "WED-911"
              },
              "type":{  
                "name":"Blocks"
              }
            }
          ]
        }
      },
      {
        "key": "WED-3774"
      }
    ]
  }