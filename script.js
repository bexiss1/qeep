const apiUrl = "https://pokeapi.co/api/v2/pokemon/";
let currentPokemon = null;
let errors = 0;
let score = 0;
let currentGeneration = "all";
let pokedex = [];

const generationRanges = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  all: [1, 721],
};

function goToMenu() {
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("gameContainer").classList.add("hidden");
}

function startGame(generation) {
  currentGeneration = generation;
  score = 0;
  errors = 0;
  document.getElementById("scoreDisplay").textContent = `Pontuação: 0/20`;
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameContainer").classList.remove("hidden");
  getRandomPokemon();
}

async function getRandomPokemon() {
  const [minId, maxId] = generationRanges[currentGeneration];
  const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

  try {
    const response = await fetch(`${apiUrl}${randomId}`);
    if (!response.ok) throw new Error("Falha na requisição de Pokémon");
    const data = await response.json();

    currentPokemon = {
      name: data.name,
      sprite: data.sprites.front_default,
      types: data.types.map((t) => t.type.name),
      generation: getGeneration(randomId),
    };
    document.getElementById("pokemonImage").src = currentPokemon.sprite;
    document.getElementById("hintDisplay").textContent = "Dica: ???";
    document.getElementById("guessInput").value = "";
    errors = 0;
  } catch (error) {
    alert("Erro ao carregar o Pokémon, tente novamente.");
    skipPokemon(); // Pular se ocorrer um erro.
  }
}

function getGeneration(id) {
  for (const [gen, range] of Object.entries(generationRanges)) {
    if (id >= range[0] && id <= range[1]) return `Geração ${gen}`;
  }
  return "Desconhecida";
}

function checkGuess() {
  const guess = document.getElementById("guessInput").value.toLowerCase();
  const hintDisplay = document.getElementById("hintDisplay");

  if (guess === currentPokemon.name.toLowerCase()) {
    let points = 0;
    if (errors === 0) points = 2;
    else if (errors === 1) points = 1;
    else if (errors === 2) points = 0.5;
    else if (errors === 3) points = 0.25;
    else if (errors === 4) points = 0.1;

    score += points;
    if (score >= 20) {
      alert("Parabéns! Você alcançou 20 pontos! Reiniciando...");
      score = 0;
    }
    document.getElementById("scoreDisplay").textContent = `Pontuação: ${score.toFixed(2)}/20`;

    addToPokedex(currentPokemon);
    getRandomPokemon();
  } else {
    errors++;
    if (errors === 1) {
      hintDisplay.textContent = `Dica: O primeiro tipo é ${currentPokemon.types[0]}`;
    } else if (errors === 2) {
      hintDisplay.textContent = `Dica: Este Pokémon pertence à ${currentPokemon.generation}`;
    } else if (errors === 3) {
      if (currentPokemon.types[1]) {
        hintDisplay.textContent = `Dica: O segundo tipo é ${currentPokemon.types[1]}`;
      } else {
        hintDisplay.textContent = "Dica: Este Pokémon não tem segundo tipo.";
      }
    } else if (errors === 4) {
      hintDisplay.textContent = `Dica: A primeira letra é '${currentPokemon.name.charAt(0).toUpperCase()}'`;
    } else if (errors === 5) {
      hintDisplay.textContent = `Dica: A resposta é ${currentPokemon.name.toUpperCase()}`;
    }
  }
}

function addToPokedex(pokemon) {
  if (!pokedex.some((p) => p.name === pokemon.name)) {
    pokedex.push(pokemon);
    renderPokedex();
  }
}

function renderPokedex() {
  const pokedexGrid = document.getElementById("pokedexGrid");
  pokedexGrid.innerHTML = "";

  pokedex.forEach((pokemon) => {
    pokedexGrid.innerHTML += `
      <div class="pokedex-item">
        <img src="${pokemon.sprite}" alt="${pokemon.name}">
        <p>${pokemon.name}</p>
      </div>
    `;
  });
}

function openPokedex() {
  document.getElementById("pokedexContainer").classList.remove("hidden");
  renderPokedex();
}

function closePokedex() {
  document.getElementById("pokedexContainer").classList.add("hidden");
}

function skipPokemon() {
  getRandomPokemon();
}

document.getElementById("submitGuess").addEventListener("click", checkGuess);
document.getElementById("skipButton").addEventListener("click", skipPokemon);
document.getElementById("openPokedexButton").addEventListener("click", openPokedex);
document.getElementById("guessInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkGuess();
  }
});

goToMenu();
