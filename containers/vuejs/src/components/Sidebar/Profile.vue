<template>


<h1 style="text-align: start;">Your profile</h1>
<p style="text-align: left;">mforstho</p>
<div style="clear: both">
	<div class="avatar" style="float: left">
		<div class="w-24 rounded">
			<img src="/vuejs/code/src/assets/mforstho.png" />
		</div>
	</div>
</div>
<div class="testing">
<p style="float: right">W/L ratio: 121/0</p>




<div style="clear: both; padding-top: 50px;">
	<h1 style="padding-bottom: 10px">Match history</h1>
</div>
<div style="clear: both">
	<p class="player1" style="float: left; padding-left: 1px; color: rgb(98, 98, 255);">mforstho</p>
	<p class="player2" style="float: right; padding-right: 1px;">safoh</p>
	<p class="match-date" style="text-align: center">04/03/2024</p>
</div>
<p>-------------------</p>
<div style="clear: both; padding-bottom: 10px;">
	<p style="float: left; padding-left: 10px; color: green;">WIN</p>
	<p style="float: right; padding-right: 10px; color: red;">LOSS</p>
	<p style="text-align: center">|</p>
</div>
<div style="clear: both">
	<p class="player1" style="float: left; padding-left: 1px; color: rgb(98, 98, 255);">mforstho</p>
	<p class="player2" style="float: right; padding-right: 1px;">safoh</p>
	<p class="match-date" style="text-align: center">04/03/2024</p>
</div>
<p>-------------------</p>
<div style="clear: both; padding-bottom: 10px;">
	<p style="float: left; padding-left: 10px; color: green;">WIN</p>
	<p style="float: right; padding-right: 10px; color: red;">LOSS</p>
	<p style="text-align: center">|</p>
</div>
<div style="clear: both">
	<p class="player1" style="float: left; padding-left: 1px; color: rgb(98, 98, 255);">mforstho</p>
	<p class="player2" style="float: right; padding-right: 1px;">safoh</p>
	<p class="match-date" style="text-align: center">04/03/2024</p>
</div>
<p>-------------------</p>
<div style="clear: both; padding-bottom: 10px;">
	<p style="float: left; padding-left: 10px; color: green;">WIN</p>
	<p style="float: right; padding-right: 10px; color: red;">LOSS</p>
	<p style="text-align: center">|</p>
</div>



<div class="achievements">
	<h1>Your achievements</h1>
	<br>
	<span class="achievement-status">
		<p>Unlocked</p>
	</span>
	<div class="tooltip">A good start<span class="tooltiptext">Win for the first time</span></div>
	<div class="tooltip">Unstoppable!<span class="tooltiptext">Win 100 times in a row</span></div>
	<br>
	<br>
	<span class="achievement-status">
		<p>Locked</p>
	</span>
	<div class="tooltip">Unfortunate<span class="tooltiptext">Lose for the first time</span></div>
	<div class="tooltip">How!?<span class="tooltiptext">Lose 100 times in a row</span></div>
</div>

</div>
</template>

<style lang="scss" scoped>
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
      padding-left: 5px;
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
</style>
