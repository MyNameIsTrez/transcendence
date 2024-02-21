<template>
  <aside :class="`${is_expanded ? 'is-expanded' : ''}`">
    <div class="logo">
      <img :src="logoURL" alt="Vue" />
    </div>

    <div class="menu-toggle-wrap">
      <button class="menu-toggle" @click="ToggleMenu">
        <span class="material-icons">keyboard_double_arrow_right</span>
      </button>
    </div>

    <h3>Menu</h3>
    <div class="menu">
      <router-link to="/" class="button">
        <span class="material-icons">home</span>
        <span class="text">Home</span>
      </router-link>
      <router-link to="/about" class="button">
        <span class="material-icons">description</span>
        <span class="text">About</span>
      </router-link>
      <router-link to="/team" class="button">
        <span class="material-icons">group</span>
        <span class="text">Team</span>
      </router-link>
      <router-link to="/contact" class="button">
        <span class="material-icons">email</span>
        <span class="text">Contact</span>
      </router-link>
    </div>

    <div class="flex"></div>

    <div class="menu">
      <router-link to="/settings" class="button">
        <span class="material-icons">settings</span>
        <span class="text">Settings</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import logoURL from '../assets/icons/user-icon.png'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
// import VueSidebarMenu from 'vue-sidebar-menu'
// import logoURL from '../assets/logo.png'

const is_expanded = ref(localStorage.getItem('is_expanded') === 'true')

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value
  localStorage.setItem('is_expanded', is_expanded.value)
}
</script>

<style lang="scss" scoped>
aside {
  display: flex;
  flex-direction: column;

  background-color: var(--dark);
  color: var(--light);

  width: calc(2rem + 32px);
  overflow: hidden;
  min-height: 100vh;
  padding: 1rem;

  transition: 0.2s ease-in-out;

  .flex {
    flex: 1 1 0%;
  }

  .logo {
    margin-bottom: 1rem;

    img {
      width: 2rem;
    }
  }

  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;

    position: relative;
    top: 0;
    transition: 0.2s ease-in-out;

    .menu-toggle {
      transition: 0.2s ease-in-out;
      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover {
        .material-icons {
          color: var(--primary);
          transform: translateX(0.5rem);
        }
      }
    }
  }

  h3,
  .button .text {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  h3 {
    color: var(--grey);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .menu {
    margin: 0 -1rem;

    .button {
      display: flex;
      align-items: center;
      text-decoration: none;

      transition: 0.2s ease-in-out;
      padding: 0.5rem 1rem;

      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-in-out;
      }
      .text {
        color: var(--light);
        transition: 0.2s ease-in-out;
      }

      &:hover {
        background-color: var(--dark-alt);

        .material-icons,
        .text {
          color: var(--primary);
        }
      }

      &.router-link-exact-active {
        background-color: var(--dark-alt);
        border-right: 5px solid var(--primary);

        .material-icons,
        .text {
          color: var(--primary);
        }
      }
    }
  }

  .footer {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;

    p {
      font-size: 0.875rem;
      color: var(--grey);
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);

    .menu-toggle-wrap {
      top: -3rem;

      .menu-toggle {
        transform: rotate(-180deg);
      }
    }

    h3,
    .button .text {
      opacity: 1;
    }

    .button {
      .material-icons {
        margin-right: 1rem;
      }
    }

    .footer {
      opacity: 0;
    }
  }

  @media (max-width: 1024px) {
    position: absolute;
    z-index: 99;
  }
}
</style>

<!-- <template>
	<sidebar-menu class="v-sidebar-menu" :menu="menu"/>
</template>

<script lang="ts">
	export default {
	  data() {
		return {
		  menu: [
			{
			  header: 'Menu',
			  hiddenOnCollapse: true,
			},
			{
			  href: '/',
			  title: 'Profile',
			//   icon: {
          	// 	//adjust element
            // 	element: 'font-awesome-icon',
            // 	attributes: { ifcon: 'user' },
          	// },
			    icon: {
          		//adjust element
            	element: 'user-icon.png',
            	attributes: {
					src: '/vuejs/icons/'
				},

          	},
			},
			{
			//   href: '/charts',
			  title: 'Charts',
			  icon: 'fa fa-chart-area',
			  child: [
				{
				  href: '/charts/sublink',
				  title: 'Sub Link',
				},
			  ],
			},
		  ],
		  props: {
			// Sidebar menu (required)
			menu: {
				type: Array,
				required: true
			},

			// Sidebar Collapse state (v-model:collapsed to enable two-way data binding)
			collapsed: {
				type: Boolean,
				default: false
			},

			// Sidebar width (expanded)
			width: {
				type: String,
				default: '290px'
			},

			// Sidebar width (collapsed)
			widthCollapsed: {
				type: String,
				default: '65px'
			},

			// Keep only one child opened at a time (first level only)
			showOneChild: {
				type: Boolean,
				default: false
			},

			// Keep all child open
			showChild: {
				type: Boolean,
				default: false
			},

			// Sidebar right to left
			rtl: {
				type: Boolean,
				default: false
			},

			// Make sidebar relative to the parent (by default the sidebar is relative to the viewport)
			relative: {
				type: Boolean,
				default: false
			},

			// Hide toggle collapse btn
			hideToggle: {
				type: Boolean,
				default: false
			},

			// Sidebar theme (available themes: 'white-theme')
			theme: {
				type: String,
				default: ''
			},

			// Disable hover on collapse mode
			disableHover: {
				type: Boolean,
				default: false
			},

			// The name of the custom link component (must be registered globally and define item as a prop)
			linkComponentName: {
				type: String,
				default: undefined
			}
			},
		}
	  },
	}
</script>

<style>
.v-sidebar-menu {
  --vsm-primary-color: #4285f4;
  /* --vsm-base-bg: #2a2a2e; */
  --vsm-base-bg: green;
  --vsm-item-color: #fff;
  /* --vsm-item-active-color:; */
  /* --vsm-item-active-bg:; */
  --vsm-item-active-line-color: var(--vsm-primary-color);
  --vsm-item-open-color: #fff;
  /* --vsm-item-hover-color: #4285f4; */
  --vsm-item-open-bg: var(--vsm-primary-color);
  --vsm-item-hover-bg: rgba(30, 30, 33, 0.5);
  --vsm-icon-color: var(--vsm-item-color);
  /* --vsm-icon-bg: #1e1e21; */
  --vsm-icon-bg: green;
  /* --vsm-icon-active-color: green; */
  /* --vsm-icon-active-bg: green; */
  --vsm-icon-open-color: green;
  /* --vsm-icon-open-bg:; */
  --vsm-mobile-item-color: #fff;
  --vsm-mobile-item-bg: var(--vsm-primary-color);
  --vsm-mobile-icon-color: var(--vsm-mobile-item-color);
  --vsm-mobile-icon-bg: transparent;
  --vsm-dropdown-bg: #36363b;
  --vsm-header-item-color: rgba(255, 255, 255, 0.7);
  --vsm-toggle-btn-color: #fff;
  --vsm-toggle-btn-bg: #1e1e21;
  --vsm-item-font-size: 16px;
  --vsm-item-line-height: 35px;
  --vsm-item-padding: 10px 15px;
  --vsm-icon-height: 35px;
  --vsm-icon-width: 3px;
}
.v-sidebar-menu .vsm--icon {
	--vsm-base-bg: green;
	--vsm-item-hover-color: green;
	--vsm-icon-bg: transparent;
}
/* .v-sidebar-menu.vsm_expanded {}
.v-sidebar-menu.vsm_collapsed {}
.v-sidebar-menu.vsm_rtl {}
.v-sidebar-menu .vsm--item {}
.v-sidebar-menu .vsm--link {}
.v-sidebar-menu .vsm--link_active {}
.v-sidebar-menu .vsm--link_hover {}
.v-sidebar-menu .vsm--link_open {}
.v-sidebar-menu .vsm--link_mobile {}
.v-sidebar-menu .vsm--link_level-[n] {}
.v-sidebar-menu .vsm--link_disabled {}
/* .v-sidebar-menu .vsm--title {} */
/* .v-sidebar-menu .vsm--arrow {}
.v-sidebar-menu .vsm--arrow_open {}
.v-sidebar-menu .vsm--badge {}
.v-sidebar-menu .vsm--badge_default {}
.v-sidebar-menu .vsm--header {}
.v-sidebar-menu .vsm--dropdown {}
.v-sidebar-menu .vsm--mobile-bg {}
.v-sidebar-menu .vsm--toggle-btn {} */
</style> -->
