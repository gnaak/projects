<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="container">
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="myTube">
            MyTube
          </div>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/search">Search</RouterLink>
          <RouterLink to="/later">Later</RouterLink>
          <RouterLink to="/channel">Channel</RouterLink>
        </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
/* .container{
  width: 90%;
  margin: 0px auto;
} */
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  display: flex;
  width: 100%;
  font-size: 12px;
  text-align: center;
  /* margin-top: 2rem; */
  color: white;
}
.myTube{
  margin-left: 20px;
}
nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
