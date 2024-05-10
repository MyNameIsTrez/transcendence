<template>
  <!-- Suspense is needed for the async get() requests we do -->
  <!-- RouterView is required to have route components like LoginView be rendered -->
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<!-- TODO: Is this still used? -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-family: 'Press Start 2P', cursive;
}
</style>
