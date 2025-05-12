<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: rgb(0, 0, 0);
}

.fillup {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.button-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

</style>
