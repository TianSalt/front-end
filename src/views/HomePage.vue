<template>
  <div class="container">
    <!-- Left side image -->
    <div class="image-container">
      <img src="@/assets/cryptodev.jpg" alt="Crypto Image" class="crypto-image" />
    </div>
    <div class="text-container">
      <h1 class="font">Welcome to Crypto Devs Exchange!</h1>
      <p>Exchange Ethereum <> Crypto Dev Tokens</p>
      <!-- Added new button -->
      <button @click="goToLiquidity">Liquidity Pool</button>
      <button @click="goToSwap">Swap</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToLiquidity() {
      // Redirect to liquidity page
      this.$router.push({ name: 'LiquidityPool' });
    },
    goToSwap() {
      // Redirect to swap page
      this.$router.push({ name: 'TradePage' });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: row;
}

.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.crypto-image {
  width: 300px; /* Adjust width as needed */
  height: auto;
}

.text-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.font {
  color: rgb(15, 15, 15);
  font-size: 50px;
  margin-bottom: 20px;
}

button {
  width: 165px;
  height: 62px;
  cursor: pointer;
  color: #fff;
  font-size: 17px;
  border-radius: 1rem;
  border: none;
  background: #100720;
  transition: 0.1s;
  margin-bottom: 10px;
}

button:active {
  transform: scale(0.9) rotate(3deg);
  background: radial-gradient(circle farthest-corner at 10% 20%, rgba(255, 94, 247, 1) 17.8%, rgba(2, 245, 255, 1) 100.2%);
  transition: 0.5s;
}
</style>
