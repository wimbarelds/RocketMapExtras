(() => {

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const TEAMS = { "1": "Mystic", "2": "Valor", "3": "Instinct" }
    const TEAM_LOGO_PATH = 'static/forts/{team}_large.png';
    let _gymDetails;

    const createElement = (tagName, classList, content) => {
        let element = document.createElement(tagName);
        // Classes
        if(typeof classList === "string") classList = classList.split(' ');
        if(typeof classList === "object" && classList instanceof Array) {
            classList.forEach((className) =>{
                if(className.length > 0) element.classList.add(className);
            });
        }
        // ChildElements
        if(typeof content !== "undefined") {
            if(typeof content !== "object" || !(content instanceof Array)){
                content = [content];
            }
            content.forEach((child) => {
                if(typeof child === "string") child = document.createTextNode(child);
                if(typeof child === "object" && child instanceof Node) element.appendChild(child);
            });
        }
        return element;
    };

    const fetchGymHistory = (gym_id) => {
        return new Promise((pass, fail) => {
            fetch('__GYMDATA_PATH__/gymchanges.php?gymid=' + encodeURIComponent(gym_id))
                .then((response) => response.json())
                .then((responseObj) => {
                    if(responseObj.success) pass(responseObj.data);
                    else fail(responseObj.message);
                });
        });
    };

    const fetchTrainerGyms = (trainer_name) => {
        return new Promise((pass, fail) => {
            fetch('__GYMDATA_PATH__/trainer_gympokemon.php?trainer_name=' + encodeURIComponent(trainer_name))
                .then((response) => response.json())
                .then((responseObj) => {
                    if(responseObj.success) pass(responseObj.data);
                    else fail(responseObj.message);
                });
        });
    };

    const fetchTrainerHistory = (trainer_name) => {
        return new Promise((pass, fail) => {
            fetch('__GYMDATA_PATH__/trainer_gymhistory.php?trainer_name=' + encodeURIComponent(trainer_name))
                .then((response) => response.json())
                .then((responseObj) => {
                    if(responseObj.success) pass(responseObj.data);
                    else fail(responseObj.message);
                });
        });
    };

    const getDateString = (date) => {
        return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
    };

    const getTimeString = (date) => {
        let minutes = '' + date.getMinutes();
        while(minutes.length < 2) {
            minutes = '0' + minutes;
        }
        return `${date.getHours()} ${minutes}`;
    };

    const formatPrestige = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const addGymHistory = (history) => {
        history.sort((a, b) => {
            if(a.timestamp !== b.timestamp) return (b.timestamp - a.timestamp);
            if(b.event === "added") return 1;
            return -1;
        });

        let historyContainer = createElement('div', 'gym-history', [
            createElement('h3', null, 'History'),
            createElement('div', 'gym-history-records', history.map((record) => {
                // Prepare some data / elements
                let date = new Date(parseInt(record.timestamp) * 1000);
                let teamName = TEAMS[record.trainer_team];
                let pokemonName = idToPokemon[record.pokemon_id].name;
                let trainerNameElement = createElement('span', null, record.trainer_name);
                trainerNameElement.addEventListener('click', trainerNameClick);

                // gym-history-record
                return createElement('div', ['gym-history-record', `pokemon-${record.event}`, `team-${teamName.toLowerCase()}`], [
                    // Icon
                    createElement('div', 'gym-history-record-icon', [
                        createElement('i', ['pokemon-sprite', `n${record.pokemon_id}`])
                    ]),
                    // Text
                    createElement('div', 'gym-history-record-text', [
                        createElement('h4', null, `(${record.cp}cp) ${pokemonName} ${record.event}`),
                        createElement('p', null, ['Trainer: ', trainerNameElement])
                    ]),
                    // When
                    createElement('div', 'gym-history-record-when', [
                        createElement('date', null, getDateString(date)),
                        createElement('time', null, getTimeString(date))
                    ])
                ])
            }))
        ]);
        _gymDetails.appendChild(historyContainer);
        
    };

    const watchGymDetailsHTML = () => {
        return new Promise((pass, fail) => {
            let initialHTML = _gymDetails.innerHTML;
            let interval = setInterval(() => {
                let html = _gymDetails.innerHTML;
                if(html != initialHTML) {
                    clearInterval(interval);
                    pass();
                }
            }, 25);
        });
    };

    const locateGym = (lat, lng) => {
        let targetLatLng = new google.maps.LatLng(lat, lng);
        searchMarker.setPosition(targetLatLng);
        map.setCenter(targetLatLng);
    };

    const setGymDetailsLoading = () => {
        clearGymDetails();

        let _loadingElement = createElement('center', null, [
            createElement('h3', null, 'Loading...')
        ]);

        _gymDetails.appendChild(_loadingElement);
    };

    const clearGymDetails = () => {
        // First get a reference to the close button and remove it
        let _close = _gymDetails.querySelector('.close');
        _close.remove();

        // Then remove everything else
        _gymDetails.innerHTML = '';

        // Then put the close button back in place
        _gymDetails.appendChild(_close);

        // Scroll to top
        _gymDetails.scrollTop = 0;
    };

    const showTrainerInfo = (args) => {
        let [trainerGymPokemon, trainerGymHistory] = args;

        // Clear the panels contents except for the closing button
        clearGymDetails();

        // Sort history
        trainerGymHistory.history.sort((a, b) => {
            if(a.timestamp !== b.timestamp) return (b.timestamp - a.timestamp);
            if(b.event === "added") return 1;
            return -1;
        });
        
        // Generic trainer info for header
        let trainerName = trainerGymPokemon.trainer.name;
        let trainerLevel = trainerGymPokemon.trainer.level;
        let team = TEAMS[trainerGymPokemon.trainer.team];
        let logoPath = TEAM_LOGO_PATH.replace('{team}', team);
        let logoElement = createElement('img', 'trainer-info-general-teamLogo');
        logoElement.setAttribute('src', logoPath);

        let trainerInfo = createElement('div', 'trainer-info', [
            createElement('div', 'trainer-info-general', [
                createElement('h2', 'trainer-info-general-trainerName', trainerName),
                logoElement,
                createElement('p', 'trainer-info-general-level', 'Level ' + trainerLevel)
            ]),
            createElement('div', 'trainer-info-gym-pokemon', [
                createElement('h3', 'trainer-info-gym-pokemon-title', 'Gyms'),
                ...trainerGymPokemon.pokemon.map((pokemon) => {
                    // trainer_gympokemon
                    // prepare variables we need
                    let gymName = pokemon.gym_name;
                    let gymPoints = parseInt(pokemon.gym_points);
                    let gymLevel = getGymLevel(gymPoints);
                    let gymLatitude = parseFloat(pokemon.latitude);
                    let gymLongitude = parseFloat(pokemon.longitude);

                    let pokemonId = pokemon.pokemon_id;
                    let pokemonName = idToPokemon[pokemonId].name;
                    let pokemonCP = pokemon.cp;

                    let locateGymButton = createElement('button', 'trainer-info-gym-pokemon-record-locate-button');
                    locateGymButton.addEventListener('click', () => {
                        locateGym(gymLatitude, gymLongitude);
                    });

                    let gymNameElement = createElement('h4', 'trainer-info-gym-pokemon-record-gym-name', gymName);
                    gymNameElement.addEventListener('click', gymNameClick);
                    gymNameElement.dataset.gymId = pokemon.gym_id;

                    return createElement('div', 'trainer-info-gym-pokemon-record', [
                        // icon	[POKEMON]	[Level][GYM]	Locate	
                        // icon				            	Locate
                        // icon	[cp]		Prestige	    Locate
                        createElement('div', 'trainer-info-gym-pokemon-record-icon', [
                            createElement('i', ['pokemon-sprite', `n${pokemonId}`])
                        ]),
                        // Text
                        createElement('div', 'trainer-info-gym-pokemon-record-pokemon', [
                            createElement('h4', null, `${pokemonName}`),
                            createElement('p', null, `${pokemonCP}cp`)
                        ]),
                        createElement('div', 'trainer-info-gym-pokemon-record-gym', [
                            createElement('div', 'trainer-info-gym-pokemon-record-gym-container', [
                                gymNameElement,
                                createElement('p', null, `Lvl ${gymLevel}, ${formatPrestige(gymPoints)} prestige`)
                            ])
                        ]),
                        // Locate
                        createElement('div', 'trainer-info-gym-pokemon-record-locate', [ locateGymButton ])
                    ]);
                })
            ]),
            createElement('div', 'trainer-info-gym-history', [
                createElement('h3', 'trainer-info-gym-history-title', 'History'),
                ...trainerGymHistory.history.map((record) => {
                    // trainer_gymhistory
                    // prepare variables we need
                    let gymName = record.gym_name;
                    let gymPoints = parseInt(record.gym_points);
                    let gymLevel = getGymLevel(gymPoints);
                    let gymLatitude = parseFloat(record.latitude);
                    let gymLongitude = parseFloat(record.longitude);

                    let pokemonId = record.pokemon_id;
                    let pokemonName = idToPokemon[pokemonId].name;
                    let pokemonCP = record.cp;

                    let event = record.event;

                    let date = new Date(parseInt(record.timestamp) * 1000);
                    let dateString = getDateString(date);
                    let timeString = getTimeString(date);

                    let gymNameElement = createElement('span', 'trainer-info-gym-history-record-text-gymname', gymName);
                    gymNameElement.addEventListener('click', gymNameClick);
                    gymNameElement.dataset.gymId = record.gym_id;

                    return createElement('div', ['trainer-info-gym-history-record', `pokemon-${event}`], [
                        createElement('div', 'trainer-info-gym-history-record-icon', [
                            createElement('i', ['pokemon-sprite', `n${pokemonId}`])
                        ]),
                        // Text
                        createElement('div', 'trainer-info-gym-history-record-text', [
                            createElement('h4', null, `(${record.cp}cp) ${pokemonName}`),
                            createElement('p', null, [((record.event == 'added') ? 'Added to ' : 'Removed from '), gymNameElement])
                        ]),
                        // When
                        createElement('div', 'trainer-info-gym-history-record-when', [
                            createElement('date', null, getDateString(date)),
                            createElement('time', null, getTimeString(date))
                        ])
                    ]);
                })
            ])
        ]);

        _gymDetails.appendChild(trainerInfo);

        console.log({trainerGymPokemon, trainerGymHistory});
    };

    const trainerNameClick = function(e){
        e.stopPropagation();

        let trainer_name = this.innerText.trim();
        let trainerGymsPromise = fetchTrainerGyms(trainer_name);
        let trainerHistoryPromise = fetchTrainerHistory(trainer_name);

        _gymDetails.setAttribute('data-id', '');
        setGymDetailsLoading();
        Promise.all([
            trainerGymsPromise,
            trainerHistoryPromise
        ])
        .then(showTrainerInfo);
    };

    const gymNameClick = function(e){
        e.stopPropagation();

        let gym_name = this.innerText.trim();
        let gym_id = this.dataset.gymId;
        setGymDetailsLoading();
        _gymDetails.setAttribute('data-id', gym_id);
        _gymDetails.dataset.id = gym_id;
    };

    const bindTrainerNames = () => {
        let trainer_names = _gymDetails.querySelectorAll('.trainer-level + div[style]');
        trainer_names.forEach((trainer_name) => {
            trainer_name.addEventListener('click', trainerNameClick);
        });
    };

    const hookToGymDetails = (gym_id) => {
        let fetchPromise = fetchGymHistory(gym_id);
        let htmlPromise = watchGymDetailsHTML();
        Promise.all([fetchPromise, htmlPromise]).then((results) => {
            var gymHistory = results[0];

            bindTrainerNames();
            addGymHistory(gymHistory);
        });
    };

    const hook = (callback) => {
        // select the target node
        _gymDetails = document.querySelector('#gym-details');
        
        // create an observer instance
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if(mutation.attributeName != "data-id") return;
                
                var id = _gymDetails.getAttribute('data-id');
                if(id != '') callback(id);
            });
        });
        
        // configuration of the observer:
        var config = { attributes: true, childList: false, characterData: false };
        
        // pass in the target node, as well as the observer options
        observer.observe(_gymDetails, config);
    };

    hook(hookToGymDetails);

})();
