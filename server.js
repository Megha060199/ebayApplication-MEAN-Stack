import express from "express"
import morgan from "morgan"
import axios from "axios"
import bodyParser from "body-parser"
import cors from "cors"
import EbayAuthToken from 'ebay-oauth-nodejs-client'
import { MongoClient, ObjectId } from "mongodb";
import { GridFsStorage } from "multer-gridfs-storage"
import multer from "multer"
import { configDotenv } from "dotenv"
import { GridFSBucket } from "mongodb"


var app = express()

var port = process.env.PORT || 8080
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization']

};


app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`Server running on ${port}`)
})
// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });

const uri = "mongodb+srv://mchandwa:PWOkSEzlO7DQlwlk@cluster0.4ghrcrh.mongodb.net/ContactApplication?retryWrites=true&w=majority"


const client = new MongoClient(uri);

const storage = new GridFsStorage({
  url: uri, 
  file: async (req, file) => {

    const metadata = {
      name: req.body.name,
      last_contact_date: req.body.last_contact_date
    };


    console.log(metadata, 'check-metadata')

      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        return {
          bucketName: "Contacts",
          filename: `${Date.now()}_${file.originalname}`,
          name: req.body.name,
          last_contact_date: req.body.last_contact_date,
          metadata: metadata
        }
      }
    
  },
});
const upload = multer({ storage })

app.post("/upload", upload.single("image"), (req, res) => {
  const file = req.file
  res.send({
    message: "Uploaded",
    id: 1,
    name: file.originalname,
    contentType: file.mimetype,
  })
})


app.get('/insertInWishList', async (req, res) => {
  try {

    const data = req.query;

    await client.connect();
    const db = client.db('ebay');
    const wishlist = db.collection('wishlist');


    const result = await wishlist.insertOne(data);
    console.log('Data added to MongoDB', result);
    if (result['insertedId']) {

      const allwishlistedItems = await wishlist.find({}).toArray();
      res.status(200).json({ 'data': Object.values(allwishlistedItems) });
    }


  } catch (err) {
    console.log(err, 'Error adding data');
    res.status(500).send('Error adding data');
  }

});




app.get("/download/:filename", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("ContactApplication");
    const imageBucket = new GridFSBucket(database, {
      bucketName: "Contacts",
    });

    const downloadStream = imageBucket.openDownloadStreamByName(req.params.filename);
    const chunks = [];

    downloadStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on("error", (error) => {
      console.error("Error downloading file:", error);
      res.status(404).send({ error: "Image not found" });
    });

    downloadStream.on("end", () => {
      const data = Buffer.concat(chunks);
      res.status(200).send(data);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Error: Something went wrong",
      error,
    });
  }
 
});

app.get("/download/", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("ContactApplication");

    const imageBucket = new GridFSBucket(database, {
      bucketName: "Contacts.files",
    });

    const filenames = req.query.filenames;

    const decodedFilenames = filenames.split(',');
    if (!Array.isArray(decodedFilenames) || decodedFilenames.length === 0) {
      return res.status(400).send({ error: "Filenames array is required" });
    }

    const downloadPromises = decodedFilenames.map((filename) => {
      return new Promise((resolve, reject) => {
        const downloadStream = imageBucket.openDownloadStreamByName(filename);
        let fileData = Buffer.alloc(0);

        downloadStream.on("data", (data) => {
          fileData = Buffer.concat([fileData, data]);
        });

        downloadStream.on("end", () => {
          resolve({
            filename: filename,
            data: fileData.toString("base64"),
          });
        });

        downloadStream.on("error", (error) => {
          reject(`Error downloading file ${filename}: ${error}`);
        });
      });
    });

    Promise.all(downloadPromises)
      .then((filesData) => {
        console.log(filesData, 'checllll')
        const joinedFilenames = filesData.map(file => file.filename).join(',');
        console.log(joinedFilenames, 'check-joined')
        res.status(200).send(joinedFilenames);
      })
      .catch((error) => {
        console.error("Error:", error);
        res.status(500).send({
          message: "Error: Something went wrong",
          error,
        });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Error: Something went wrong",
      error,
    });
  }
});

app.use(express.static("./build"))

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


// WIP
app.post('/updateUser',async(req,res)=>{


  const contactId = req.body.id;
  console.log(req.body)
   

  if (contactId) {
    const db = client.db('ContactApplication');
    const collection = db.collection('Contacts.files');
    const existingContact = await collection.findOne({ _id: new ObjectId(contactId) });;
    if (!existingContact) {
      throw new Error("Contact not found");
    }
    const image = path.basename(existingContact.image_url)

    const result = await collection.deleteOne({ _id: contactId });
    
    console.log(result,'check-result')
   
    
    }

})
app.post('/updateUser', async (req, res) => {
  try {
    const { id, name,last_contact_date } = req.body; // Assuming newData contains the updated fields
    console.log(req.body);

    if (!id) {
      throw new Error("Missing contact ID");
    }

    const db = client.db('ContactApplication');
    const collection = db.collection('Contacts.files');

    const existingContact = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingContact) {
      throw new Error("Contact not found");
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "metadata.name": name, "metadata.last_contact_date": last_contact_date } }
    );

    console.log(result, 'check-result');

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/removeItem/:id', async (req, res) => {
  try {


    await client.connect();
    const db = client.db('ebay');
    const collection = db.collection('wishlist');
    const itemId = req.params.id;
    console.log(itemId, 'checkkk')

    const result = await collection.deleteOne({ _id: itemId });
    console.log(result, 'check-result')
    if (result.deletedCount) {
      const allwishlistedItems = await collection.find({}).toArray();
      res.status(200).json({ 'data': Object.values(allwishlistedItems) });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing the item' });
  }
  finally {
    await client.close();
  }
});


app.get('/getContactList', async (req, res) => {

  try {
    await client.connect();
    const database = client.db('ContactApplication'); 
    const collection = database.collection('Contacts.files'); 
    const pipeline = [
      {
        $addFields: {
          parsedDate: { $dateFromString: { dateString: "$metadata.last_contact_date" } } 
        }
      },
      {
        $sort: { parsedDate: -1 }
      },
      {
        $project: {
          parsedDate: 0 
        }
      }
    ];

    const cursor = collection.aggregate(pipeline);
    const data = await cursor.toArray();
    console.log(data,'check-data')
    res.json({ 'data': Object.values(data) });
  
  } catch (error) {
    console.error('Error executing aggregation pipeline:', error);
  } finally {

    // client.close();
  }

});


app.get('/getWishlistedItems', async (req, res) => {
  try {
    await client.connect();

    const database = client.db('ebay'); 
    const collection = database.collection('wishlist'); 

    const data = await collection.find({}).toArray();
    console.log(data, 'checkkk')
    res.json({ 'data': Object.values(data) });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving data' });
  } finally {
    await client.close();
  }
});



app.get('/getItemsByKeyword', async (req, res) => {
  try {
    var data = JSON.stringify(req.query)
    console.log(`----------------${data}------------------- checkkkk request obj`)
    var payload = {}
    payload = {
      'OPERATION-NAME': 'findItemsAdvanced',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': 'MeghaCha-app-PRD-372726e2f-c683d8ca',
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': true,
      'keywords': 'iphone',
      'paginationInput.entriesPerPage': 50,
      'paginationInput.pageNumber': 1,
      'outputSelector(0)': 'SellerInfo',
      'outputSelector(1)': 'StoreInfo'
    }
    composePayload(data, payload)

    const response = await axios.get('https://svcs.ebay.com/services/search/FindingService/v1', {
      params: payload
    })


    console.log(response.data.findItemsAdvancedResponse[0], 'RESSSSSS')
    console.log(JSON.stringify(response.data.findItemsAdvancedResponse[0].errorMessage), 'Check error')
    if (response.data.findItemsAdvancedResponse[0].searchResult['@count'] == 0)
      response.data.findItemsAdvancedResponse[0].searchResult['item'] = []

    res.send(response.data.findItemsAdvancedResponse[0])
  }
  catch (err) {
    console.log(err, 'ERR')
  }
})
var composePayload = (data, payload) => {
  var parsedQueryData = JSON.parse(data)
  const keys = Object.keys(parsedQueryData)
  var count = 0

  for (let k of keys) {


    if (k == 'keywords' || k == 'buyerPostalCode' || k == 'categoryId') {
      if (k == 'categoryId' && parsedQueryData[k] == 'All Categories') {
        continue
      }
      payload[`${k}`] = parsedQueryData[k]
    }
    else {

      if (k == 'Condition') {

        if (typeof (parsedQueryData[k]) == 'string') {


          var parsedCondition = JSON.parse(parsedQueryData[k])

          if (parsedCondition.length > 0) {

            payload[`itemFilter(${count}).name`] = k
            for (let val in parsedCondition) {

              payload[`itemFilter(${count}).value(${val})`] = parsedCondition[val]
            }
            count += 1
          }
        }
      }
      else {

        if (parsedQueryData[k]) {
          payload[`itemFilter(${count}).name`] = k
          payload[`itemFilter(${count}).value`] = parsedQueryData[k]
          count += 1
        }

      }





    }
  }

}


app.get('/pinCodeSuggestion', async (req, res) => {
  try {

    var payload = {}
    payload = {
      'postalcode_startsWith': parseInt(req.query.postalcode_startsWith),
      'maxRows': 5,
      'username': 'meghac_',
      'country': 'US'
    }
    const response = await axios.get('http://api.geonames.org/postalCodeSearchJSON?', {
      params: payload
    })
    console.log(response.data, 'RESSSSSSS')
    res.send(response.data)
  }
  catch (err) {
    console.log(err, 'ERROR GEONAMESSSS')


  }
})


app.get('/getSingleItem', async (req, res) => {


  try {

    var data = JSON.parse(JSON.stringify(req.query))
    console.log(data, 'checkkkk dataaaa')
    var token = await getToken()
    console.log('---------TOEKNNNN ON RETURN------------', token)
    token = JSON.parse(token)
    const headers = {
      'X-EBAY-API-IAF-TOKEN': token.access_token
    }
    console.log(headers, 'see-headersss')


    const payload = {
      'callname': 'GetSingleItem',
      'responseencoding': 'JSON',
      'appid': 'MeghaCha-app-PRD-372726e2f-c683d8ca',
      'siteid': '0',
      'version': '967',
      'ItemID': data.item_id,
      "IncludeSelector": "Description,Details,ItemSpecifics"

    }

    const response = await axios.get('https://open.api.ebay.com/shopping?', {
      headers: headers,
      params: payload
    })
    console.log(response.data, 'get single item result')
    res.send(response.data)
  }
  catch (err) {
    console.log("ERRRRR", err)
  }

})


app.get('/searchEngine', async (req, res) => {
  try {
    var data = JSON.parse(JSON.stringify(req.query))
    const payload = {
      'q': data.q,
      'cx': '54ab628322a54475e',
      'imgSize': 'huge',
      'num': 8,
      'searchType': 'image',
      'key': 'AIzaSyAQjRITJqowO-td5eXXAJ0R_koFSJfkkf4'

    }
    const response = await axios.get('https://www.googleapis.com/customsearch/v1?', {
      params: payload
    })
    console.log(response.data, '-------------------checkkk search enginer---------------')
    res.send(response.data)

  }
  catch (err) {
    console.log(err, 'CHECKKK ERRR')
  }
})







var getToken = async () => {
  const ebayAuthToken = new EbayAuthToken({
    clientId: client_id,
    clientSecret: client_secret
  });
  const token = await ebayAuthToken.getApplicationToken('PRODUCTION');
  return token
}


app.get('/getSimilarProducts', async (req, res) => {


  try {

    var data = JSON.parse(JSON.stringify(req.query))
    console.log(data, 'similar products data')


    const payload = {
      'OPERATION-NAME': 'getSimilarItems',
      'SERVICE_NAME': 'Merchandising Service',
      'SERVICE-VERSION': '1.1.0',
      'CONSUMER-ID': 'MeghaCha-app-PRD-372726e2f-c683d8ca',
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': true,
      'itemId': data.item_id,
      'maxResults': 20

    }

    const response = await axios.get('https://svcs.ebay.com/MerchandisingService?', {
      params: payload
    })
    console.log(JSON.parse(JSON.stringify(response.data)), 'see-res')
    res.send(response.data)
  }
  catch (err) {
    console.log("ERRRRR", err)
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





