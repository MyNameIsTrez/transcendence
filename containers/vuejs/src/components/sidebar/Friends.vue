<template>
	<div class="flex justify-end">
		<div class="tooltip tooltip-left" data-tip="Add friend">
			<button class="btn btn-primary btn-square self-auto" onclick="my_modal_2.showModal()">
				<span class="material-symbols-outlined">person_add</span>
			</button>
			<dialog id="my_modal_2" class="modal">
				<div class="modal-box">
					<p class="py-4">Add a friend</p>
					<span class="flex justify-center">
						<input type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
						<button class="btn">Add</button>
					</span>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</div>
	</div>
	<h1>---- Online ----</h1>
	<div class="card lg:card-side bg-base-200">
		<figure><div class="w-28 avatar online"><img class="rounded" src="https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg" alt="Album"/></div></figure>
  		<div class="card-body h-28">
			<div style="clear: both">
    			<h2 style="float: left; padding-top: 10px;" class="card-title">sbos</h2>
				<div style="float: right" class="dropdown dropdown-bottom dropdown-end">
    				<div tabindex="0" role="button" class="m-1 btn btn-primary btn-square"><span class="material-symbols-outlined" style="font-size: 30px;">settings</span></div>
					<ul tabindex="0" class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max">
   						<li><a>View profile</a></li>
    					<li><a>Invite to game</a></li>
    					<li><a>Open chat</a></li>
    					<li><a>Remove friend</a></li>
  					</ul>
				</div>
			</div>
  		</div>
	</div>
	<br>
	<div class="card lg:card-side bg-base-200">
		<figure><div class="w-28 avatar online"><img class="rounded" src="https://cdn.intra.42.fr/users/300b8f9ea2e55b6f9e7cf25723d86958/safoh.jpg" alt="Album"/></div></figure>
  		<div class="card-body h-28">
			<div style="clear: both">
    			<h2 style="float: left; padding-top: 10px;" class="card-title">safoh</h2>
    			<div style="float: right" class="dropdown dropdown-bottom dropdown-end">
    				<div tabindex="0" role="button" class="m-1 btn btn-primary btn-square"><span class="material-symbols-outlined" style="font-size: 30px;">settings</span></div>
					<ul tabindex="0" class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max">
   						<li><a>View profile</a></li>
    					<li><a>Invite to game</a></li>
    					<li><a>Open chat</a></li>
    					<li><a>Remove friend</a></li>
  					</ul>
				</div>
			</div>
  		</div>
	</div>
	<br>
	<h1>---- Offline ----</h1>
	<div class="card lg:card-side bg-base-200">
		<figure><div class="w-28 avatar offline"><img class="rounded" src="https://cdn.intra.42.fr/users/0519bc4a463d666788591a6fcb3dc296/vbenneko.jpg" alt="Album"/></div></figure>
  		<div class="card-body h-28">
			<div style="clear: both">
    			<h2 style="float: left; padding-top: 10px;" class="card-title">vbenn</h2>
    			<div style="float: right" class="dropdown dropdown-bottom dropdown-end">
    				<div tabindex="0" role="button" class="m-1 btn btn-primary btn-square"><span class="material-symbols-outlined" style="font-size: 30px;">settings</span></div>
					<ul tabindex="0" class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max">
   						<li><a>View profile</a></li>
    					<li><a>Invite to game</a></li>
    					<li><a>Open chat</a></li>
    					<li><a>Remove friend</a></li>
  					</ul>
				</div>
			</div>
  		</div>
	</div>
	<br>
	<div class="card lg:card-side bg-base-200">
		<figure><div class="w-28 avatar offline"><img class="rounded" src="https://cdn.intra.42.fr/users/fd9763e1d199fc213b51af711e0ecb83/lvan-bus.jpg" alt="Album"/></div></figure>
  		<div class="card-body h-28">
			<div style="clear: both">
    			<h2 style="float: left; padding-top: 10px;" class="card-title">lvan</h2>
    			<div style="float: right" class="dropdown dropdown-bottom dropdown-end">
    				<div tabindex="0" role="button" class="m-1 btn btn-primary btn-square"><span class="material-symbols-outlined" style="font-size: 30px;">settings</span></div>
					<ul tabindex="0" class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max">
   						<li><a>View profile</a></li>
    					<li><a>Invite to game</a></li>
    					<li><a>Open chat</a></li>
    					<li><a>Remove friend</a></li>
  					</ul>
				</div>
			</div>
  		</div>
	</div>
</template>
