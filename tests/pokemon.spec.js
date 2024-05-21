const { test, expect } = require("@playwright/test");
const PokemonPage = require("./pokemonHelper");

test.describe("Pokemon", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Check list pokemon", async ({ page }) => {
    await page.route("**/api/graphql", async (route, request) => {
      const postData = JSON.parse(request.postData());

      if (postData.operationName === "pokemon") {
        const { variables } = postData;
        expect(variables).toEqual({
          limit: 10,
          offset: 0,
        });
      }

      route.continue();
    });
    await page.waitForSelector('[data-cy="pokedex-item-pokemon-name"]');
    const itemList = await page.$$('[data-cy="pokedex-item-pokemon-name"]');

    for (let index = 0; index < itemList.length; index++) {
      const element = itemList[index];
      await element.scrollIntoViewIfNeeded();
      const textContent = await element.innerText();
      const trimmedText = textContent.trim();
      console.log("Pokemon Name:", trimmedText);
    }
  });

  test("Should be able to hunting pokemon", async ({ page }) => {
    await page.getByRole("button", { name: "#001 bulbasaur" }).click();
    await page.getByText("#001bulbasaurgrasspoison").click();
    await expect(
      page.getByTestId("pokemon-details-pokemon-stats")
    ).toBeVisible();
    await page.getByRole("button", { name: "See Move List" }).click();
    await page.getByText("Pokemon Moves").click();
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("button", { name: "Hunt bulbasaur" }).click();
    const pokemonPage = new PokemonPage(page);
    await pokemonPage.huntPokemon();
  });

  test("Should be able to search pokemon", async ({ page }) => {
    await page.getByText("Pokemon Details").click();
    await page.getByPlaceholder("Search Pokemon...").fill("bulbasaur");
    await expect(
      page.locator('[data-cy="pokemon-card-pokemon-name"]')
    ).toHaveText("bulbasaur");
    await page
      .locator('[data-cy="pokemon-search-view-pokemon-button"]')
      .click();
    await expect(
      page.locator('[data-cy="pokemon-details-pokemon-stats"]')
    ).toBeVisible();
  });

  test("Should show message if pokemon cant found on search", async ({
    page,
  }) => {
    await page.getByText("Pokemon Details").click();
    await page.getByPlaceholder("Search Pokemon...").fill("bul");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Pokemon doesn't exist")).toBeVisible();
  });

  test("Should be able to release pokemon", async ({ page }) => {
    const parentElement = await page.locator('[role="alert"]');
    const closeAllert = await parentElement.locator('[aria-label="Close"]');
    await page.getByRole("button", { name: "#001 bulbasaur" }).click();
    await page.getByRole("button", { name: "Hunt bulbasaur" }).click();
    const pokemonPage = new PokemonPage(page);
    await pokemonPage.huntPokemon();
    await expect(
      page.getByText("Successfully catched and saved new Pokemon.")
    ).toBeVisible();
    await closeAllert.click();
    await page.getByText("My Pokemons").click();
    await expect(page.getByText("new Pokemon")).toBeVisible;
    await page.getByRole("button", { name: "Release All" }).click();
    await page.getByTestId("release-pokemon-release-button").click();
    await expect(
      page.getByText("You released all of your pokemons.")
    ).toBeVisible();
    await closeAllert.click();
  });

  test("Should be able show error message if name already exist", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "#001 bulbasaur" }).click();
    await page.getByRole("button", { name: "Hunt bulbasaur" }).click();
    const pokemonPage = new PokemonPage(page);
    await pokemonPage.huntPokemon();
    await page.getByRole("button", { name: "Hunt bulbasaur" }).click();
    await pokemonPage.huntPokemon();
    await expect(page.getByText("Nickname already exist")).toBeVisible();
  });
});
