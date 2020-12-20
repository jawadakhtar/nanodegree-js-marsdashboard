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

            if (process.env.API_KEY === 'YOURS_NASA_API_KEY')
            {
                console.log('Invalid NASA API KEY. Please set the API Key as per the README.md');
                return;
            }

            //todo: implement pagination
            var failed = false;
            const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/latest_photos?api_key=${process.env.API_KEY}`;
            const roverData = await fetch(url)
                                        .then(res => res.json())
                                        .catch(error => {
                                            failed = true;                                            
                                        });

            if(failed === true || roverData.latest_photos === null || roverData.latest_photos.length === 0)
            {
                attempts++;
                console.log('No data received from NASA server. Making ' + attempts + " attempt...");
                continue;
            }

            const rovers =
                {   
                    rover: roverData.latest_photos.reduce( (acc, crnt) => {return crnt.rover.name;}),
                    landing: roverData.latest_photos.reduce( (acc, crnt) => {return crnt.rover.landing_date;}),
                    launch: roverData.latest_photos.reduce( (acc, crnt) => {return crnt.rover.launch_date;}),
                    status: roverData.latest_photos.reduce( (acc, crnt) => {return crnt.rover.status;}),
                    earthDate: roverData.latest_photos.reduce( (acc, crnt) => {return crnt.earth_date;}),
                    images: roverData.latest_photos.map( p => p.img_src)
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