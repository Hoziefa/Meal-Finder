const elements = {
    mealsContainer: document.getElementById("meals"),
    form: document.getElementById("submit"),
    randomBtn: document.getElementById("random"),
    searchInput: document.getElementById("search"),
    singleMeal: document.getElementById("single-meal"),
    resultHeading: document.querySelector("#result-heading h4"),
    domLoader: document.querySelector(".loader"),
};

const displayLoader = (show = false) => {
    const { domLoader } = elements;

    show ? domLoader.classList.add("show-loader") : domLoader.classList.remove("show-loader");
};

const clearContents = (...contents) => contents.forEach(content => (content.textContent = ""));

const getMeals = async endpoint => await fetch(`https://www.themealdb.com${endpoint}`).then(res => res.json());

const renderMeal = ({ idMeal, strMealThumb, strMeal }) => {
    let markup = `
        <div class="meal" data-id="${idMeal}">
            <img src="${strMealThumb}" alt="${strMeal}" />
            <div class="meal-info"><h3>${strMeal}</h3></div>
        </div>
	`;

    elements.mealsContainer.insertAdjacentHTML("beforeend", markup);
};

elements.form.addEventListener("submit", async e => {
    e.preventDefault();

    const { searchInput, singleMeal, resultHeading, mealsContainer } = elements;

    let query = searchInput.value.trim();

    if (!query) return;

    displayLoader(true);

    const { meals } = await getMeals(`/api/json/v1/1/search.php?s=${query}`);

    displayLoader();

    if (!meals) return;

    clearContents(mealsContainer, singleMeal, resultHeading);

    resultHeading.textContent = `Search results for: ${query}`;

    meals.forEach(renderMeal);

    e.target.reset();
});

const renderSingleMeal = meal => {
    const ingredients = Array.from(
        { length: 20 },
        (_, idx) =>
            meal[`strIngredient${idx}`] && `${meal[`strIngredient${idx}`]} - ${meal[`strMeasure${idx}`]}`,
    ).filter(Boolean);

    const { strMeal, idMeal, strMealThumb, strCategory, strArea, strInstructions } = meal;

    let markup = `
        <div class="single-meal" data-id="${idMeal}">
            <h2>${strMeal}</h2>
            <img src="${strMealThumb}" alt="${strMeal}" />
            <div class="single-meal-info">
                ${strCategory ? `<p>${strCategory}</p>` : ""}
                ${strArea ? `<p>${strArea}</p>` : ""}
            </div>
            <div class="main">
                <p>${strInstructions}</p>
                <h3>Ingredients</h3>
                <ul>${ingredients.map(ing => `<li>${ing}</li>`).join("")}</ul>
            </div>
        </div>
    `;

    elements.singleMeal.insertAdjacentHTML("beforeend", markup);
};

elements.mealsContainer.addEventListener("click", async ({ target }) => {
    if (!target.matches(".meal")) return;

    let { id } = target.dataset;

    displayLoader(true);

    const meal = await getMeals(`/api/json/v1/1/lookup.php?i=${id}`).then(({ meals: [meal] }) => meal);

    displayLoader();

    if (!meal) return;

    clearContents(elements.singleMeal);

    renderSingleMeal(meal);
});

elements.randomBtn.addEventListener("click", async _ => {
    displayLoader(true);

    const [meal] = await getMeals("/api/json/v1/1/random.php").then(({ meals }) => meals);

    displayLoader();

    if (!meal) return;

    clearContents(elements.resultHeading, elements.mealsContainer, elements.singleMeal);

    renderSingleMeal(meal);
});
