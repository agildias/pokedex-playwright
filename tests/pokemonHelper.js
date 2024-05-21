const { expect } = require("@playwright/test");

class BasePage {
  constructor(page) {
    this.page = page;
  }
}

class PokemonPage extends BasePage {
  async waitForBulbasaur() {
    await this.page.waitForTimeout(6000);
    await expect(
      await this.page.getByRole("heading", { name: "Looking for bulbasaur" })
    ).toBeHidden();
  }

  async isBulbasaurCaught() {
    return await this.page.isVisible('text="Bulbasaur catched successfully !"');
  }

  async savePokemon(nickName) {
    await this.page.getByRole("button", { name: "Save Pokemon" }).click();
    await this.page.fill('input[placeholder="Nickname"]', nickName);
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async randomPokemonName(){
    const randomName = Math.random().toString(36).substring(7);
    await this.page.getByRole("button", { name: "Save Pokemon" }).click();
    await this.page.fill('input[placeholder="Nickname"]', randomName);
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async returnToHunting() {
    await this.page.getByRole("button", { name: "Return" }).click();
    await this.page.getByRole("button", { name: "Hunt bulbasaur" }).click();
  }

  async huntPokemon() {
    const successHunt = async () => {
      await this.waitForBulbasaur();
      const isCaught = await this.isBulbasaurCaught();
      if (isCaught) {
        await this.savePokemon('new Pokemon');
      } else {
        await this.returnToHunting();
        await successHunt();
      }
    };
    await successHunt();
  }
}

module.exports = PokemonPage;
