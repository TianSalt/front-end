<template>
  <div>
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#2d3748"
      text-color="#edf2f7"
      active-text-color="#81e6d9"
      :default-active="'1'"
    >
      <el-menu-item index="1">↔️ Transaction</el-menu-item>
      <el-menu-item index="2">📊 Liquidity Pool</el-menu-item>
      <el-menu-item index="3">💼 Personal Account</el-menu-item>
    </el-menu>
    <!-- Swap Form Section -->
    <div
      style="
        display: flex;
        justify-content: center;
        margin-top: 20px;
        padding: 20px;
      "
    >
      <div
        style="
          width: 400px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        "
      >
        <h2 style="text-align: center; font-weight: bold">Transaction</h2>
        <!-- connect Metamask Button -->
        <div style="margin-bottom: 20px">
          <label for="sale" style="font-size: 16px; font-weight: 500"
            >You Pay</label
          >
          <div style="display: flex; align-items: center">
            <el-input
              id="sale"
              v-model="soldAmount"
              style="flex: 1; margin: 10px; font-size: 18px; height: 40px"
              type="number"
              min="0"
              @input="calculateBuyAmount"
            />
            <el-select
              v-model="saleToken"
              placeholder="Select"
              style="width: 100px; height: 40px"
              @change="buyToken = saleToken == 'RCT' ? 'AWT' : 'RCT'"
            >
              <el-option
                :label="token"
                :value="token"
                v-for="token in tokenOptions"
                :key="token"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div style="margin-bottom: 20px">
          <label for="buy" style="font-size: 16px; font-weight: 500"
            >To Purchase</label
          >
          <div style="font-size: 12px; color: #999">
            for reference only, real-time value may fluctuate
          </div>
          <div style="display: flex; align-items: center">
            <el-input
              id="buy"
              v-model="buyAmount"
              style="flex: 1; margin: 10px; font-size: 18px; height: 40px"
              type="number"
              min="0"
              disabled
            />
            <div style="width: 100px; font-weight: 600">
              {{ buyToken }}
            </div>
          </div>
        </div>
        <div>
          <el-radio v-model="radio" label="1" @change="handleRadioChange"
            >Curve AMM</el-radio
          >
          <el-radio v-model="radio" label="2" @change="handleRadioChange"
            >Constant Mean AMM</el-radio
          >
        </div>
        <div
          v-if="transactionStatus"
          style="margin-top: 20px; text-align: center"
        >
          <!-- 处理中 -->
          <div
            v-if="transactionStatus === 'pending'"
            style="color: orange; font-weight: bold"
          >
            Transaction processing ...
          </div>

          <!-- 成功 -->
          <div v-else-if="transactionStatus === 'success'">
            <div style="color: green; font-weight: bold">
              Transaction Succeeded.
            </div>
            <div style="color: green; font-size: 13px">
              {{ successContent }}
            </div>
          </div>

          <!-- 失败 -->
          <div v-else-if="transactionStatus === 'error'">
            <div style="color: red; font-size: 12px">{{ errorContent }}</div>
          </div>
        </div>

        <!-- Swap Button -->
        <el-button
          type="primary"
          class="modern-swap-button"
          @click="swapTokens"
        >
          ⇄　Swap Tokens
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import axios from "axios";
export default {
  name: "SwapPage",
  data() {
    return {
      soldAmount: 0,
      buyAmount: null,
      saleToken: "AWT", // 默认选择的出售代币
      buyToken: "RCT", // 默认选择的购买代币
      tokenOptions: ["AWT", "RCT"], // 可选择的代币列表
      contract: null,
      contractAddresses: {
        1: null, // 替换为实际合约地址
        2: null,
      },
      reserve: null,
      popularity: null,
      transactionStatus: null, // 交易状态 (null: 未开始, 'pending': 处理中, 'success': 成功, 'error': 失败)
      transactionHash: "",
      radio: "1",
      errorContent: "Error",
      successContent: "Succeess",
      signer: null,
    };
  },
  created() {
    // 从路由参数获取来源并动态设置默认代币
    const poolId = this.$route.params.poolId;
    if (!poolId) {
      this.initializeTokens("default"); // 使用默认值
    } else {
      this.initializeTokens(poolId);
    }
  },
  mounted() {
    axios
      .get("http://localhost:3300/address")
      .then((result) => {
        this.contractAddresses = {
          1: result.data.addressCurve, // 替换为实际合约地址
          2: result.data.addressSum,
        };
        this.connectContract(this.contractAddresses[this.radio]);
      })
      .catch((error) => {
        this.transactionStatus = "error";
        this.errorContent = error;
        console.error(error);
      });
  },
  methods: {
    handleSelect(index) {
      if (index == "1") {
        this.$router.push({ name: "TradePage" });
      } else if (index == "2") {
        this.$router.push({ name: "LiquidityPool" });
      } else if (index == "3") {
        this.$router.push({ name: "PersonalAccount" });
      }
    },
    initializeTokens(poolId) {
      // 根据来源页面设置默认代币
      switch (poolId) {
        case "curve":
          this.saleToken = "AWT";
          this.buyToken = "RCT";
          this.radio = "1";
          break;
        case "constantMean":
          this.saleToken = "AWT";
          this.buyToken = "RCT";
          this.radio = "2";
          break;
        default:
          this.saleToken = "AWT";
          this.buyToken = "RCT";
          this.radio = "1";
          break;
      }
    },
    handleRadioChange() {
      this.connectContract(this.contractAddresses[this.radio]);
    },

    // 根据 sellAmount, reserve, popularity 计算 this.buyAmount
    // sellAmount 为用户输入，this.buyAmount 要呈现给用户
    async calculateBuyAmount(reserve, popularity) {
      const sellAmount = parseFloat(this.soldAmount);
      if (this.radio == "1") {
        // 如果是 Curve AMM
        // 进行一番计算
        // this.buyAmount = 计算结果;
      } else if (this.radio == "2") {
        // 如果是 Constant Mean AMM
        // 进行一番计算
        // this.buyAmount = 计算结果;
      }
    },

    async connectMetamask() {
      try {
        // 检查 Metamask 是否安装
        if (!window.ethereum) {
          this.$message.error("Metamask 未启用");
          return;
        }
        // 请求 Metamask 连接
        const provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await provider.getSigner();
      } catch (error) {
        this.transactionStatus = "error";
        this.errorContent = error;
        console.error(error);
      }
    },
    // 连接合约
    async connectContract(address) {
      this.connectMetamask();
      try {
        const abi = [
          "function swap(uint flag, uint amount) external flagRange(flag)",
          "function getReserve() public view returns(uint, uint)",
          "function getExchangeFee() public view returns(uint, uint)",
        ];
        this.contract = new ethers.Contract(address, abi, this.signer);
        this.reserve = await this.contract.getReserve();
        this.popularity = await this.contract.getPopularity();
        this.calculateBuyAmount(this.reserve, this.popularity);
      } catch (error) {
        this.transactionStatus = "error";
        this.errorContent = error;
        console.error(error);
      }
    },
    async swapTokens() {
      this.connectContract(this.contractAddresses[this.radio]);
      try {
        const boughtAmount =
          (await this.contract.swap(
            this.saleToken == "AWT" ? 0 : 1,
            this.soldAmount * 100
          )) / 100;

        this.transactionStatus = "success";
        this.successContent =
          "You purchased " +
          boughtAmount +
          (this.saleToken == "AWT" ? " AWT in the " : " RCT in the ") +
          (this.radio == "1" ? "Curve AMM Pool" : "Constant Mean Pool");
        const signerAddress = await this.signer.getAddress();
        await axios.post("http://localhost:3300/transaction", {
          pool: this.radio, // 哪个池子，'1' 代表 Curve，'2' 代表 Constant Mean
          token: this.saleToken, // 付出给系统的是哪个币，取值 'AWT' 或 'RCT'
          soldAmount, // 付出给系统多少代币
          boughtAmount, // 从系统得到了多少目标代币
          time: Date.now(), // UNIX 整型时间戳
          signerAddress, // 做出请求的用户
        });
      } catch (error) {
        this.transactionStatus = "error"; // 更新交易状态为 "失败"
        this.errorContent = error;
        console.error(error);
      }
      this.calculateBuyAmount();
    },
  },
};
</script>

<style scoped>
.el-input {
  border-radius: 6px;
  font-size: 18px;
}

/* 基础按钮样式 - 紫色主题 */
.modern-swap-button {
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 20px;
  border: none !important;
  border-radius: 8px !important;
  padding: 12px 0 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  color: white !important;

  /* 紫色渐变背景（深紫到亮紫） */
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important;

  /* 紫色系阴影 */
  box-shadow: 0 4px 6px rgba(106, 17, 203, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* 悬停效果 */
.modern-swap-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(106, 17, 203, 0.3), 0 3px 6px rgba(0, 0, 0, 0.1) !important;
}

/* 点击效果 */
.modern-swap-button:active {
  transform: translateY(0);
  /* 加深紫色渐变 */
  background: linear-gradient(135deg, #5a0db5 0%, #1a68e6 100%) !important;
}

.el-menu-demo {
  transition: all 0.3s ease; /* 平滑过渡效果 */
  border-bottom: 1px solid rgba(79, 209, 197, 0.3); /* 与激活色呼应的底边 */
}

.el-menu-item {
  transition: text-shadow 0.2s;
}

.el-menu-item.is-active {
  text-shadow: 0 0 12px currentColor; /* 当前颜色的柔和光晕 */
  border-bottom: 2px solid currentColor !important; /* 底部高光线 */
}
</style>
