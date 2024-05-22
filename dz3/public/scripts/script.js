const fetchGames = async url => {
  try {
    const games = await fetch(url);
    return games.json();
  } catch (error) {
    console.log(error);
  }
};

const showPlaceholder = (selector, message) => {
  const placeholder = document.createElement("li");
  placeholder.classList.add("placeholder");
  placeholder.textContent = message;
  document.querySelector(selector).append(placeholder);
};

const removePlaceholder = selector => {
  const placeholder = document.querySelector(selector);
  if (placeholder) {
    placeholder.remove();
  }
};

const buildCard = (object, template) => {
  const node = template.content.cloneNode(true);
  node.querySelector("a").href = object.link;
  node.querySelector("img").src = object.image;
  node.querySelector("h2").textContent = object.title;
  node.querySelector("p").textContent = object.description;
  return node;
};

const createListItem = (parent, item, template) => {
  const li = document.createElement("li");
  li.id = `game-${item.id}`;
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Удалить";
  deleteButton.classList.add("delete-game__button");
  li.append(buildCard(item, template));
  li.append(deleteButton);
  parent.prepend(li);
  submitDelete(li);
};

const createGamesListItems = (listSelector, template, array) => {
  const ul = document.querySelector(listSelector);
  array.forEach(item => {
    createListItem(ul, item, template);
  });
};

fetchGames("/games").then(data => {
  if (!data || !data.length) {
    showPlaceholder(".games-list", "Нет игр в базе данных. Добавьте игру.");
    return;
  } else {
    createGamesListItems(
      ".games-list",
      document.querySelector("#game-card"),
      data
    );
  }
});

document.querySelector(".add-game__button").addEventListener("click", () => {
  document.querySelector("#form-dialog").showModal();
});

document.querySelector(".close-dialog").addEventListener("click", () => {
  document.querySelector("#form-dialog").close();
});

const sendForm = async (url, object) => {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(object)
    });
    return resp;
  } catch (error) {
    console.log(error);
  }
};

const submitForm = (() => {
  const form = document.querySelector(".game-form");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(form);
    const objectToSend = {
      title: data.get("title"),
      image: data.get("image"),
      link: data.get("link"),
      description: data.get("description")
    };
    const resp = await sendForm("/games", objectToSend);
    if (resp.status !== 200) {
      form.querySelector(".form__message").classList.add("error");
      form.querySelector(".form__message").textContent =
        "Игра с таким именем уже есть";
      return;
    }
    form.querySelector(".form__message").classList.add("success");
    form.querySelector(".form__message").textContent = "Игра добавлена";
    const obj = (await resp.json()).updated;
    createListItem(
      document.querySelector(".games-list"),
      obj,
      document.querySelector("#game-card")
    );
    form.reset();
    document.querySelector("#form-dialog").close();
    removePlaceholder(".placeholder");
  });
})();

const deleteGame = async (url, id) => {
  try {
    const response = await fetch(`${url}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });
  } catch (error) {
    console.log(error);
  }
};

const submitDelete = async item => {
  item
    .querySelector(".delete-game__button")
    .addEventListener("click", async e => {
      const id = e.target.parentElement.id.split("-")[1];
      await deleteGame("/games", id);
      e.target.parentElement.remove();
      let hasCards = document.querySelectorAll(".games-list li");
      if (!hasCards.length) {
        showPlaceholder(".games-list", "Нет игр в базе данных. Добавьте игру.");
      }
    });
};
