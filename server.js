import express  from "express"
import morgan from "morgan"
import axios from "axios"
import bodyParser from "body-parser"
import cors from "cors"
import EbayAuthToken from 'ebay-oauth-nodejs-client'
import {MongoClient} from "mongodb";
// import { ObjectId } from 'mongodb';


// import _ from "loadash"


var app = express()

var port = process.env.PORT || 8080
const corsOptions = {
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization']

  };

// var jsonParser = bodyParser.json()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.use(bodyParser.json());
// app.use(jsonParser)
app.listen(port,()=>{
    console.log(`Server running on ${port}`)
})

// app.get('',(req,res)=>{
// res.send('Hello world yayy i made changes')
// })
var client_id = "MeghaCha-app-PRD-372726e2f-c683d8ca"
var client_secret = "PRD-72726e2fec65-55d4-4965-827d-869b"
const uri = "mongodb+srv://mchandwa:PWOkSEzlO7DQlwlk@cluster0.4ghrcrh.mongodb.net/?retryWrites=true&w=majority"


const client = new MongoClient(uri);


app.get('/insertInWishList', async (req, res) => {
    try {

      const data = req.query; 
      
      // Connect to MongoDB
      await client.connect();
      const db = client.db('ebay');
      const wishlist = db.collection('wishlist');
  
     
      const result = await wishlist.insertOne(data);
      console.log('Data added to MongoDB', result);
      if(result['insertedId']) {

        const allwishlistedItems = await wishlist.find({}).toArray();
        res.status(200).json({'data':Object.values(allwishlistedItems)});
        // res.status(200).json(result)
      }

      
    } catch (err) {
      console.log(err, 'Error adding data');
      res.status(500).send('Error adding data');
    } finally {
      await client.close();
    }
  });

app.use(express.static("./dist/assignment3-fe"))

//   app.get('/removeFromWishList', async (req, res) => {
//     try {

//       const data = req.query; // Assuming you're sending data in the request body
      
//       // Connect to MongoDB
//       await client.connect();
//       const db = client.db('ebay');
//       const wishlist = db.collection('wishlist');
  
//       // Insert data into the collection
//       const result = await wishlist.insertOne(data);
//       console.log('Data added to MongoDB', result);
      
//       // Respond with a success message
//       res.status(200).json(result)
//     } catch (err) {
//       console.error(err, 'Error adding data');
//       res.status(500).send('Error adding data');
//     } finally {
//       // Close the MongoDB connection
//       await client.close();
//     }
//   });


  app.get('/removeItem/:id', async (req, res) => {
    try {
      
  
      await client.connect();
      const db = client.db('ebay');
      const collection = db.collection('wishlist'); // Replace with your collection name
  
      // Get the ID from the request parameters
      const itemId = req.params.id;
      console.log(itemId,'checkkk')
  
      // Convert the itemId to an ObjectID
    //   const itemObjectId = new ObjectId(itemId);
  
      // Remove the item by its ID
      const result = await collection.deleteOne({ _id: itemId });
        console.log(result,'check-result')
      if (result.deletedCount) {
        const allwishlistedItems = await collection.find({}).toArray();
        res.status(200).json({'data':Object.values(allwishlistedItems)});
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error removing the item' });
    } finally {
      await client.close();
    }
  });



  app.get('/getWishlistedItems', async (req, res) => {
    try {
      // Connect to MongoDB
      await client.connect();
  
      const database = client.db('ebay'); // Replace with your database name
      const collection = database.collection('wishlist'); // Replace with your collection name
  
      const data = await collection.find({}).toArray();
       console.log(data,'checkkk')
      res.json({'data':Object.values(data)});
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'An error occurred while retrieving data' });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });
  
  

app.get('/getItemsByKeyword',async (req,res)=> {
    try {
        // console.log(req,'see request')
        var data = JSON.stringify(req.query)
        console.log(`----------------${data}------------------- checkkkk request obj`)
        var payload = {}
        payload = {
            'OPERATION-NAME':'findItemsAdvanced',
            'SERVICE-VERSION':'1.0.0',
            'SECURITY-APPNAME':'MeghaCha-app-PRD-372726e2f-c683d8ca',
            'RESPONSE-DATA-FORMAT':'JSON',
            'REST-PAYLOAD':true,
            'keywords': 'iphone',
            'paginationInput.entriesPerPage':50,
            'paginationInput.pageNumber':1,
            'outputSelector(0)':'SellerInfo',
            'outputSelector(1)':'StoreInfo'
        }
        composePayload(data,payload)
     
        const response = await axios.get('https://svcs.ebay.com/services/search/FindingService/v1',{
            params:payload
        })


        console.log(response.data.findItemsAdvancedResponse[0],'RESSSSSS')
        console.log(JSON.stringify(response.data.findItemsAdvancedResponse[0].errorMessage),'Check error')
        if (response.data.findItemsAdvancedResponse[0].searchResult['@count'] == 0)
        response.data.findItemsAdvancedResponse[0].searchResult['item'] = []

        res.send(response.data.findItemsAdvancedResponse[0])
    }
    catch(err){
        console.log(err,'ERR')
    }
})
var composePayload=(data,payload)=>{
    var parsedQueryData = JSON.parse(data)
    const keys = Object.keys(parsedQueryData)
    var count = 0
  
     for(let k of keys)
      {
        
        
    if( k == 'keywords' || k == 'buyerPostalCode' || k == 'categoryId')
    {
        if (k == 'categoryId' && parsedQueryData[k]=='All Categories')
        {
            continue
        }
        payload[`${k}`] = parsedQueryData[k]
    }
    else
    {
       
          if (k == 'Condition')
          {
            
            // payload[`itemFilter(${count}).name`] = k
            if (typeof(parsedQueryData[k]) == 'string')
            {

              
              var parsedCondition = JSON.parse(parsedQueryData[k])
          
              if (parsedCondition.length > 0 )
              {
               
              payload[`itemFilter(${count}).name`] = k
              for (let val in parsedCondition )
              {
                 
                  payload[`itemFilter(${count}).value(${val})`] = parsedCondition[val]
              }
              count+=1
            }
             
            }
       
            
          
       
         }
        else
        {
        
           if (parsedQueryData[k])
           {
            payload[`itemFilter(${count}).name`] = k
            payload[`itemFilter(${count}).value`] = parsedQueryData[k]
            count+=1
           }
      
        }
          
        
        

        
      }
    }
      console.log(payload,'check-payload')
    

}


app.get('/pinCodeSuggestion',async(req,res)=>{
try{

var payload = {}
payload = {
    'postalcode_startsWith':parseInt(req.query.postalcode_startsWith),
    'maxRows':5,
    'username':'meghac_',
    'country':'US'
}
const response = await axios.get('http://api.geonames.org/postalCodeSearchJSON?',{
    params:payload
})
console.log(response.data, 'RESSSSSSS')
res.send(response.data)
}
catch(err)
{
    console.log(err,'ERROR GEONAMESSSS')
    // res.send(err.response.status)
    
  
}
})


app.get('/getSingleItem',async(req,res)=>{

    
  try {

    var data = JSON.parse(JSON.stringify(req.query))
    console.log(data, 'checkkkk dataaaa')
    var token = await getToken()
    console.log('---------TOEKNNNN ON RETURN------------', token)
    token = JSON.parse(token)
   const headers = {
    'X-EBAY-API-IAF-TOKEN': token.access_token
   }
   console.log(headers,'see-headersss')
 
    
    const payload = {
        'callname':'GetSingleItem',
        'responseencoding':'JSON',
        'appid':'MeghaCha-app-PRD-372726e2f-c683d8ca',
        'siteid':'0',
        'version':'967',
        'ItemID':data.item_id,
        "IncludeSelector":"Description,Details,ItemSpecifics"
      
    }

    const response = await axios.get('https://open.api.ebay.com/shopping?',{
        headers:headers,
        params:payload
})
   console.log(response.data, 'get single item result')
    res.send(response.data)
}
catch(err)
{
    console.log("ERRRRR" , err)
}

})


app.get('/searchEngine',async(req,res)=>{
    try 
    {
        var data = JSON.parse(JSON.stringify(req.query))
        const payload = {
            'q':data.q,
            'cx':'54ab628322a54475e',
            'imgSize':'huge',
            'num':8,
            'searchType':'image',
            'key':'AIzaSyAQjRITJqowO-td5eXXAJ0R_koFSJfkkf4'

        }
        const response = await axios.get('https://www.googleapis.com/customsearch/v1?',{
            params:payload
    })
       console.log(response.data,'-------------------checkkk search enginer---------------')
        res.send(response.data)

    }
    catch(err)
    {
console.log(err,'CHECKKK ERRR')
    }
})







var getToken = async() =>{
    const ebayAuthToken = new EbayAuthToken({
        clientId: client_id,
        clientSecret: client_secret
    });
    const token = await ebayAuthToken.getApplicationToken('PRODUCTION');
    // console.log(token,'see tokennnn')
    return token
}


app.get('/getSimilarProducts',async(req,res)=>{

    
    try {
  
      var data = JSON.parse(JSON.stringify(req.query))
      console.log(data, 'similar products data')
   
      
      const payload = {
          'OPERATION-NAME':  'getSimilarItems',
          'SERVICE_NAME':    'Merchandising Service',
          'SERVICE-VERSION':  '1.1.0',
          'CONSUMER-ID':'MeghaCha-app-PRD-372726e2f-c683d8ca',
          'RESPONSE-DATA-FORMAT':'JSON',
          'REST-PAYLOAD': true,
          'itemId':data.item_id,
          'maxResults':20
        
      }
  
      const response = await axios.get('https://svcs.ebay.com/MerchandisingService?',{
          params:payload
  })
     console.log(JSON.parse(JSON.stringify(response.data)),'see-res')
      res.send(response.data)
  }
  catch(err)
  {
      console.log("ERRRRR" , err)
  }
})





// var getItems = async (req,res)=> {
//     try {
//         console.log(res,'yayyyy-lets checkkkkk')
//         const response = await axios.get('https://svcs.ebay.com/services/search/FindingService/v1',{
//             params:{
//                 'OPERATION-NAME':'findItemsAdvanced',
//                 'SERVICE-VERSION':'1.0.0',
//                 'SECURITY-APPNAME':'MeghaCha-app-PRD-372726e2f-c683d8ca',
//                 'RESPONSE-DATA-FORMAT':'JSON',
//                 'REST-PAYLOAD':true,
//                 'keywords': 'iphone',
//                 'sortOrder':'Best Match',
//                 'paginationInput.entriesPerPage':10,
//                 'paginationInput.pageNumber':1
//             }
//         })
//         console.log(response.data.findItemsAdvancedResponse[0].searchResult,'RESSSSSS')
//         res.(res.data.findItemsAdvancedResponse[0].searchResult)
//     }
//     catch(err){
//         console.log(err,'ERR')
//     }
// }





