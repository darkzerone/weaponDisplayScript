const weaponData = require("./weaponData");

const SMGAttachmentPos = new mp.Vector3(0.08, 0.03, -0.1);
const SMGAttachmentRot = new mp.Vector3(-80.77, 0.0, 0.0);

const ShotgunAttachmentPos = new mp.Vector3(-0.1, -0.15, 0.11);
const ShotgunAttachmentRot = new mp.Vector3(-180.0, 0.0, 0.0);

const RifleAttachmentPos = new mp.Vector3(-0.1, -0.15, -0.13);
const RifleAttachmentRot = new mp.Vector3(0.0, 0.0, 3.5);

const AttachBoneLeftHip = 58271;
const AttachBoneBack = 24818;

const smgList = [
    'WEAPON_ASSAULTSMG',
    'WEAPON_COMBATPDW',
    'WEAPON_MACHINEPISTOL',
    'WEAPON_MINISMG',
    'WEAPON_SMG_MK2',
    'WEAPON_SMG',
    'WEAPON_MICROSMG',
];

const arList = [
    'WEAPON_ASSAULTRIFLE',
    'WEAPON_ASSAULTRIFLE_MK2',
    'WEAPON_CARBINERIFLE',
    'WEAPON_CARBINERIFLE_MK2',
    'WEAPON_SPECIALCARBINE',
    'WEAPON_SPECIALCARBINE_MK2',
    'WEAPON_MARKSMANRIFLE',
    'WEAPON_MARKSMANRIFLE_MK2',
    'WEAPON_ADVANCEDRIFLE',
    'WEAPON_BULLPUPRIFLE',
    'WEAPON_COMPACTRIFLE',
];

const mgList = [
    'WEAPON_MG',
    'WEAPON_COMBATMG',
    'WEAPON_GUSENBERG',
];

const snrList = [
    'WEAPON_SNIPERRIFLE',
    'WEAPON_HEAVYSNIPER',
    'WEAPON_MARKSMANRIFLE',
];

const shotgunList = [
    'WEAPON_PUMPSHOTGUN',
    'WEAPON_SAWNOFFSHOTGUN',
    'WEAPON_ASSAULTSHOTGUN',
    'WEAPON_BULLPUPSHOTGUN',
    'WEAPON_HEAVYSHOTGUN',
    'WEAPON_DBSHOTGUN',
    'WEAPON_AUTOSHOTGUN',
]

const heavyList = [
    'WEAPON_GRENADELAUNCHER',
    'WEAPON_MINIGUN',
    'WEAPON_FIREWORK',
    'WEAPON_RAILGUN',
    'WEAPON_HOMINGLAUNCHER',
    'WEAPON_COMPACTLAUNCHER'
];

var weaponAttachmentData = {} 

function createAttachmentDataFromArray(gunList, AttachBonePosition, AttachPosition, AttachRotation, weaponSlot) {
    gunList.forEach(gunName => {
        weaponAttachmentData = {
            ...weaponAttachmentData,
            [gunName] : {Slot : weaponSlot, AttachBone: AttachBonePosition, AttachPosition: AttachPosition, AttachRotation: AttachRotation}
        }
    });
}

createAttachmentDataFromArray(smgList, AttachBoneLeftHip, SMGAttachmentPos, SMGAttachmentRot, 'hipSlot');
createAttachmentDataFromArray(arList, AttachBoneBack, RifleAttachmentPos, RifleAttachmentRot, 'rightBackSlot');
createAttachmentDataFromArray(mgList, AttachBoneBack, ShotgunAttachmentPos, ShotgunAttachmentRot,'leftBackSlot');
createAttachmentDataFromArray(snrList, AttachBoneBack, RifleAttachmentPos, RifleAttachmentRot, 'rightBackSlot');
createAttachmentDataFromArray(heavyList, AttachBoneBack, RifleAttachmentPos, RifleAttachmentRot, 'rightBackSlot');
createAttachmentDataFromArray(shotgunList, AttachBoneBack, ShotgunAttachmentPos, ShotgunAttachmentRot, 'leftBackSlot');


for (let weapon in weaponAttachmentData) {
    let hash = mp.joaat(weapon);

    if (weaponData[hash]) {
        weaponAttachmentData[weapon].AttachName = `WDSP_${weaponData[hash].HashKey}`;
        weaponAttachmentData[weapon].AttachModel = weaponData[hash].ModelHashKey;
    } else {
        console.log(`[!] ${weapon} not found in weapon data file and will cause issues, remove it from weaponAttachmentData.`);
    }
}

mp.events.add("playerReady", (player) => {
    player._bodyWeapons = {};
    player.call("registerWeaponAttachments", [ JSON.stringify(weaponAttachmentData) ]);
});

mp.events.add("playerWeaponChange", (player, oldWeapon, newWeapon) => {
    if (weaponData[oldWeapon]) {
        let oldWeaponKey = weaponData[oldWeapon].HashKey;
        if (weaponAttachmentData[oldWeaponKey]) {
            // Remove the attached weapon that is occupying the slot
            let slot = weaponAttachmentData[oldWeaponKey].Slot;
            if (player._bodyWeapons[slot] && player.hasAttachment(player._bodyWeapons[slot])) player.addAttachment(player._bodyWeapons[slot], true);

            // Attach the updated old weapon
            let attachName = weaponAttachmentData[oldWeaponKey].AttachName;
            player.addAttachment(attachName, false);
            player._bodyWeapons[slot] = attachName;
        }
    }

    if (weaponData[newWeapon]) {
        let newWeaponKey = weaponData[newWeapon].HashKey;
        if (weaponAttachmentData[newWeaponKey]) {
            // Remove/attach the new/current weapon if attached
            let slot = weaponAttachmentData[newWeaponKey].Slot;
            let attachName = weaponAttachmentData[newWeaponKey].AttachName;

            if (player._bodyWeapons[slot] === attachName) {
                if (player.hasAttachment(attachName)) player.addAttachment(attachName, true);
                delete player._bodyWeapons[slot];
            }
        }
    }
});

// Remove all weapons on death from the player
mp.events.add("playerDeath", (player) => {
    for (let name in player._bodyWeapons) {
        player.addAttachment(player._bodyWeapons[name], true);
        delete player._bodyWeapons[name];
    }
});