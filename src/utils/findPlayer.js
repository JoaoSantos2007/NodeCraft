const findPlayer = async (gamertag) => {
  try {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${gamertag}`);
    const data = await res.json();

    return data.id;
  } catch (err) {
    return undefined;
  }
};

export default findPlayer;
