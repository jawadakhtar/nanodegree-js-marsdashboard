require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

/**
 * @description makes an API call to NASA server to get the given rover mission details along with images
 */
app.get('/roverDetails', async(req, res) => {
    try
    {
        let attempts = 1;

        //make max 3 attempts to get the results from NASA server
        while(attempts <= 3)
        {
            const roverName = req.query.name.toLowerCase(); 
            const sol = Math.round(Math.random() * 1000); //to get different images each time
            //todo: implement pagination
            const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${sol}&page=1&api_key=${process.env.API_KEY}`;
            
            const roverData = await fetch(url)
                                        .then(res => res.json());        
            
            if(roverData.photos.length === 0)
            {
                attempts++;
                console.log('No data received from NASA server. Making ' + attempts + " attempt...");
                continue;
            }

            const rovers =
                {   
                    rover: roverData.photos.reduce( (acc, crnt) => {return crnt.rover.name;}),
                    landing: roverData.photos.reduce( (acc, crnt) => {return crnt.rover.landing_date;}),
                    launch: roverData.photos.reduce( (acc, crnt) => {return crnt.rover.launch_date;}),
                    status: roverData.photos.reduce( (acc, crnt) => {return crnt.rover.status;}),
                    earthDate: roverData.photos.reduce( (acc, crnt) => {return crnt.earth_date;}),
                    images: roverData.photos.map( p => p.img_src)
                };
            
            res.send(rovers);
            break;
        }
    }
    catch(error)
    {
        console.log(error);
    }
}
);


app.listen(port, () => console.log(`Example app listening on port ${port}!`))