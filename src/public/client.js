
let store = Immutable.Map(
    {
        user: Immutable.Map({ name: "Jawad" }),
        apod: "",
        planet: "Mars",
        rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
        selectedRover:""
    }
);

// add our markup to the page
const root = document.getElementById('root');

/**
 * @description updates the Store with given state
 * @param {Store} state the current state of Store
 * @param {Store} newState the new state of Store 
 */
const updateStore = (state, newState) => {
    store = state.merge(newState);
    render(root, store); //renders the UI on each update
}

/**
 * @description render the application state, generates the application starting UI and bind the user input control events for user intraction
 * @param {Element} root the root of the DOM
 * @param {Store} state the current state of Store
 */
const render = async (root, state) => {
    root.innerHTML = App(state); //generates the application starting UI
        
    //bind the button click events for user intraction to update the store and to query the server to get the selected rover details
    store.get("rovers").map(roverName=> { 
        document.getElementById(`${roverName}Btn`).addEventListener("click",function(e){
            const newState = state.set("selectedRover", roverName);
            updateStore(state, newState);
            getMissionDetails(store);        
        }); 
        }   
    );
}

// create content
const App = (state) => {
    const markup =  `
        <h1> Intermediate JavaScript Udacity Nanodegree </h1>
    
        ${Greeting(store.get('user').get('name'))}
            <h2>NASA MARS MISSIONS</h2>
            ${DisplayMissions(state)}
    `;

    return markup;
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});


/**
 * @description gets the state and dynamically generate the markup to show the images
 * @param {Store} state the current state of Store
 * @param {Object} roverImages An object received from the server
 */
const showImages = (state, roverImages) => {
    const roverName = state.get("selectedRover");//roverImages.rover;
    document.getElementById(`${roverName}Images`).innerHTML =
    `<h3>Launch: ${roverImages.launch}</h3>` +
    `<h3>Landing: ${roverImages.landing}</h3>` +
    `<h3>Status: ${roverImages.status}</h3>` +  
    `<h3>Photos taken on : ${roverImages.earthDate}</h3>` +
        roverImages.images.map(img => 
            `<img src="${img}" width="400" height="400" /> &nbsp;`
        ).join('');
}

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

/**
 * @description Pure function to render the MARS Missions
 * @param {Store} state the current state of Store
 */
const DisplayMissions = (state) => {
    let missions = '';
    state.get('rovers').map(roverName=>{
        missions += `<div> 
                        <h2>${roverName}</h2> 
                        <img id="${roverName}" width="200" src="https://upload.wikimedia.org/wikipedia/commons/2/27/Mars_transparent.png" /> 
                        <div id="${roverName}Images"> 
                        <button id="${roverName}Btn">Get ${roverName} Insights...</button> 
                        </div>
                    </div>
                    <br/>`
    });
    return missions;
}

// ------------------------------------------------------  API CALLS

/**
 * @description makes an API call to server to get the selectedRover mission details along with images
 * @param {Store} state the current state of Store
 */
const getMissionDetails = (state) => {
    const url = new URL(`http://localhost:3000/roverDetails`);
    url.searchParams.append("name", state.get("selectedRover"));

    fetch(url)
    .then(res => res.json())
    .then(data => {
        showImages(state, data);
    });
}
