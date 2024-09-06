const api = "https://pokeapi.co/api/v2/pokemon?limit=30&offset=0";
const smImg = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const bgImg = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

async function getFromApi(api) {
    const response = await fetch(api);
    const data = await response.json();
    return data;
}

function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 1).lastIndexOf('/') + 1, url.length - 1);
}

const $container = document.getElementById('container');
const $pokeList = document.getElementById('pokeList');
const $more = document.getElementById('more');
const $dialog = document.getElementById('dialog');

function displayPoke() {
    getFromApi(api).then(data => {
        const next = data['next'];
        const results = data['results'];
        $more.value = next;
        appendHtml(results);
    });
}

$more.addEventListener('click', async function(e) {
    $more.disabled = true;
    if (e.target.value) {
        const nextData = await getFromApi(e.target.value);
        const nextResults = nextData['results'];
        $more.value = nextData['next'];
        appendHtml(nextResults);
    }
    $more.disabled = false;
});

function appendHtml(results) {
    const caughtHistory = JSON.parse(localStorage.getItem('caught-pokes')) || [];
    results.forEach(pokemon => {
        const pokeId = parseUrl(pokemon.url);
        const isCaught = caughtHistory.includes(pokeId);
        const className = isCaught ? "status-on" : "status-off";
        const imgSrc = `${smImg}/${pokeId}.png`;
        const hdImgSrc = `${bgImg}/${pokeId}.png`;

        const pokemonCard = `
            <div class="col mb-3 border rounded mx-1 ${className}" id="img-id-${pokeId}">
                <div>
                    <picture class="picture" name="${pokemon.name}" url="${pokemon.url}" data-hdimage="${hdImgSrc}">
                        <source srcset="${hdImgSrc} 475w">
                        <img class="img-fluid thumb-img poke-img" src="${imgSrc}">
                    </picture>
                </div>
                <div class="fs-4">${pokemon.name}</div>
            </div>
        `;

        $pokeList.insertAdjacentHTML('beforeend', pokemonCard);
    });
}

$container.addEventListener('click', async function(e) {
    const $picture = e.target.closest('picture');
    if ($picture) {
        const name = $picture.getAttribute('name');
        const url = $picture.getAttribute('url');
        const pokeId = parseUrl(url);
        const ls = JSON.parse(localStorage.getItem('caught-pokes')) || [];
        const isCaught = ls.includes(pokeId);
        const buttonStatus = isCaught ? "release" : "catch";
        const buttonText = isCaught ? "Release" : "Catch";
        const buttonStyle = isCaught ? "btn-danger" : "btn-success";
        const className = isCaught ? "status-on" : "status-off";

        const data = await getFromApi(url);
        const types = data.types.map(t => t.type.name).join();
        const moves = data.moves.map(m => m.move.name).slice(0, 6).join();

        const $imgContainer = document.createElement('div');
        $imgContainer.classList.add('container');
        $imgContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-12">
                    <button type="button" class="btn-close float-end" aria-label="Close"></button>
                </div>
                <div class="col text-center">
                    <div class="fs-1 fw-bold">${name}</div>
                    <div class="${className}"><img class="rounded img-fluid dialog-img poke-img" src="${$picture.dataset.hdimage}"></div>
                </div>
                <div class="col">
                    <div class="fs-3 mt-1">Types</div>
                    <div class="fs-5 text-body-secondary border rounded p-2 bg-light">${types}</div>
                    <div class="fs-3 mt-1">Moves</div>
                    <div class="fs-5 text-body-secondary border rounded p-2 bg-light text-wrap">${moves}</div>
                    <button id="${buttonStatus}" class="btn ${buttonStyle} my-3 w-100 fs-5">${buttonText}</button>
                </div>
            </div>
        `;

        $dialog.innerHTML = '';
        $dialog.classList.remove('open');
        $dialog.append($imgContainer);
        $dialog.showModal();
        $dialog.classList.add('open');

        const $close = document.querySelector('.btn-close');
        $close.addEventListener('click', function() {
            $dialog.close();
        });

        const $button = document.getElementById(buttonStatus);
        $button.addEventListener('click', function() {
            const caughtHistory = JSON.parse(localStorage.getItem('caught-pokes')) || [];
            if (buttonStatus === "catch") {
                caughtHistory.push(pokeId);
                localStorage.setItem('caught-pokes', JSON.stringify(caughtHistory));
                $picture.closest('.col').classList.add('status-on');
            } else if (buttonStatus === "release") {
                const index = caughtHistory.indexOf(pokeId);
                if (index !== -1) {
                    caughtHistory.splice(index, 1);
                    localStorage.setItem('caught-pokes', JSON.stringify(caughtHistory));
                    $picture.closest('.col').classList.remove('status-on');
                }
            }
            $dialog.close();
        });
    }
});

displayPoke();