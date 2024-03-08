<template>
  <!-- <aside :class="`${is_expanded ? 'is-expanded' : ''}`"> -->
  <aside class="test">
    <!-- <div class="logo">
			<img :src="logoURL" alt="Vue" />
		</div> -->

    <!-- <div class="menu-toggle-wrap">
			<button class="menu-toggle" @click="ToggleMenu">
				<span class="material-icons">keyboard_double_arrow_right</span>
			</button>
		</div> -->

    <h3>Menu</h3>
    <div class="menu">
      <!-- <button class="button" onclick="console.log('Profile')">
				<span class="material-icons">person</span>
				<span class="text">Profile</span>
			</button> -->
      <button class="button" onclick="console.log('Friends')">
        <span class="material-icons">group</span>
        <span class="text">Friends</span>
      </button>
      <button class="button" onclick="console.log('Leaderboard')">
        <span class="material-icons">list</span>
        <span class="text">Leaderboard</span>
      </button>
      <router-link to="/profile" class="button">
        <span class="material-icons">person</span>
        <span class="text">Profile</span>
      </router-link>
      <div class="testing">
        <h1>Your profile</h1>
        <p>mforstho</p>
        <div style="clear: both">
          <img style="float: left" src="/vuejs/code/src/assets/mforstho.png" />
          <p style="float: right">Win/Loss ratio: 121/0</p>
        </div>

        <div style="clear: both; padding-top: 50px">
          <h1 style="padding-bottom: 10px">Match history</h1>
        </div>
        <div style="clear: both">
          <p class="player1" style="float: left; padding-left: 5px; color: rgb(98, 98, 255)">
            mforstho
          </p>
          <p class="player2" style="float: right; padding-right: 5px">safoh</p>
          <p class="match-date" style="text-align: center">04/03/2024</p>
        </div>
        <p>------------------------------------------------------</p>
        <div style="clear: both; padding-bottom: 10px">
          <p style="float: left; padding-left: 10px; color: var(--primary)">WIN</p>
          <p style="float: right; padding-right: 10px; color: red">LOSS</p>
          <p style="text-align: center">|</p>
        </div>
        <div style="clear: both">
          <p class="player1" style="float: left; padding-left: 5px; color: rgb(98, 98, 255)">
            mforstho
          </p>
          <p class="player2" style="float: right; padding-right: 5px">safoh</p>
          <p class="match-date" style="text-align: center">04/03/2024</p>
        </div>
        <p>------------------------------------------------------</p>
        <div style="clear: both; padding-bottom: 10px">
          <p style="float: left; padding-left: 10px; color: var(--primary)">WIN</p>
          <p style="float: right; padding-right: 10px; color: red">LOSS</p>
          <p style="text-align: center">|</p>
        </div>
        <div style="clear: both">
          <p class="player1" style="float: left; padding-left: 5px; color: rgb(98, 98, 255)">
            mforstho
          </p>
          <p class="player2" style="float: right; padding-right: 5px">safoh</p>
          <p class="match-date" style="text-align: center">04/03/2024</p>
        </div>
        <p>------------------------------------------------------</p>
        <div style="clear: both; padding-bottom: 10px">
          <p style="float: left; padding-left: 10px; color: var(--primary)">WIN</p>
          <p style="float: right; padding-right: 10px; color: red">LOSS</p>
          <p style="text-align: center">|</p>
        </div>

        <div class="achievements">
          <h1>Your achievements</h1>
          <span class="achievement-status">
            <p>Unlocked</p>
          </span>
          <div class="tooltip">
            A good start<span class="tooltiptext">Win for the first time</span>
          </div>
          <div class="tooltip">
            Unstoppable!<span class="tooltiptext">Win 100 times in a row</span>
          </div>

          <span class="achievement-status">
            <p>Locked</p>
          </span>
          <div class="tooltip">
            Unfortunate<span class="tooltiptext">Lose for the first time</span>
          </div>
          <div class="tooltip">How!?<span class="tooltiptext">Lose 100 times in a row</span></div>
        </div>
      </div>
    </div>
    <!-- <router-link to="/about" class="button">
				<span class="material-icons">group</span>
				<span class="text">Friends</span>
			</router-link>
			<router-link to="/team" class="button">
				<span class="material-icons">list</span>
				<span class="text">Leaderboard</span>
			</router-link> -->


		<div class="flex"></div>

		<div class="menu">
			<router-link to="/settings" class="button">
				<span class="material-icons">settings</span>
				<span class="text">Settings</span>
			</router-link>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import logoURL from '../assets/icons/user-icon.png'

// const is_expanded = ref(localStorage.getItem("is_expanded") === "true")

// const ToggleMenu = () => {
// 	is_expanded.value = !is_expanded.value
// 	localStorage.setItem("is_expanded", is_expanded.value)
// }
</script>

<style lang="scss" scoped>
aside {
	display: flex;
	flex-direction: column;

	background-color: var(--dark);
	color: var(--light);

	width: calc(2rem + 400px);
	overflow: hidden;
	min-height: 100vh;
	padding: 1rem;

	transition: 0.2s ease-in-out;
	
	.testing {
		p {
			margin-left: 20px;
			margin-right: 20px;
			text-align: start;
			font-size: large;
		}

		img {
			width: 8rem;
			margin-left: 20px;
			display: block;
			border: 5px solid #ffffff;
		}
	}

	.match-report {
		p {
			clear: both;
			margin-left: 20px;
			margin-right: 20px;
		}

		.player1 {
			p {
				float: left;
				// text-align: left;
			}
		}

		.player2 {
			p {
				float: right;
				// text-align: right;
			}
		}

		.match-date {
			p {
				float: center;
			}
		}
	}

	.achievements {
		padding-top: 30px;

		p {
			padding-left: 10px;
		}

		.achievement-status {
			font-weight: bold;
		}
	}

	.tooltip {
		text-align: left;
		padding-left: 30px;
		padding-top: 2px;
		position: relative;
		// border-bottom: 1px dotted black;
	}

	.tooltip .tooltiptext {
		visibility: hidden;
		width: 120px;
		background-color: white;
		color: black;
		text-align: center;
		border-radius: 6px;
		padding: 5px 0;

		position: absolute;
		z-index: 1;
	}

	.tooltip:hover .tooltiptext {
		visibility: visible;
	}

	.flex {
		flex: 1 1 0%;
	}

	.logo {
		margin-bottom: 1rem;

		img {
			width: 2rem;
		}
	}

	.material-icons {
		font-size: 2rem;
		color: var(--light);
		transition: 0.2s ease-out;
	}

	&:hover {
		.material-icons {
			color: var(--primary);
			// transform: translateX(0.5rem);
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
			display: inline-block; // TODO: 'flex' om buttons onder elkaar te zetten, 'inline-block' om buttons naast elkaar te zetten
			align-items: center;
			text-decoration: none;

			transition: 0.2s ease-in-out;
			padding: 0.5rem 1rem;

			.material-icons {
				font-size: 2rem;
				color: var(--light);
				transition: 0.2s ease-in-out;
				margin-right: 1rem;
			}

			.text {
				opacity: 1;
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
