// Coin Input Fix für src/app/page.tsx

// ERSETZEN:
onChange={e => setNewTaskCoins(Number(e.target.value))}

// MIT:
onChange={e => setNewTaskCoins(e.target.value === "" ? 0 : Number(e.target.value))}


// ERSETZEN:
onChange={e => setNewRewardCoins(Number(e.target.value))}

// MIT:
onChange={e => setNewRewardCoins(e.target.value === "" ? 0 : Number(e.target.value))}


// ERSETZEN:
onChange={e => setNewChestPrice(Number(e.target.value))}

// MIT:
onChange={e => setNewChestPrice(e.target.value === "" ? 0 : Number(e.target.value))}


// ERSETZEN:
onChange={e => setNewShopPrice(Number(e.target.value))}

// MIT:
onChange={e => setNewShopPrice(e.target.value === "" ? 0 : Number(e.target.value))}


// ERSETZEN:
value={newTaskCoins}

// MIT:
value={newTaskCoins === 0 ? "" : newTaskCoins}


// ERSETZEN:
value={newRewardCoins}

// MIT:
value={newRewardCoins === 0 ? "" : newRewardCoins}


// ERSETZEN:
value={newChestPrice}

// MIT:
value={newChestPrice === 0 ? "" : newChestPrice}


// ERSETZEN:
value={newShopPrice}

// MIT:
value={newShopPrice === 0 ? "" : newShopPrice}
