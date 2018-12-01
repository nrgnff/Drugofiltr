import './style/style.css';
import renderFriends from './temp/list.hbs';
import renderNewFriends from './temp/filtered_list.hbs';
import { isMatching, compareNames } from './help/help.js';

const friendsList = document.querySelector('#friendList');
const filteredList = document.querySelector('#filteredList');
let friendsArr = localStorage.getItem('friendsArr') ? JSON.parse(localStorage.getItem('friendsArr')) : [];
let newFriendsArr = localStorage.getItem('newFriendsArr') ? JSON.parse(localStorage.getItem('newFriendsArr')) : [];
const filterFilteredList = document.querySelector('#filterFilteredList');
const filterFullList = document.querySelector('#filterFullList');
const saveButton = document.querySelector('#saveButton');
let createFriendslist = (friends) => renderFriends({ items: friends });
let createNewFriendslist = (friends) => renderNewFriends({ items: friends });

VK.init({
    apiId: 6763683
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизироваться'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.92';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    })
}

    (async () => {
        try {
            await auth();
            let friends = await callAPI('friends.get', { fields: 'photo_100', order: 'random' });
            if (friendsArr.length === 0) {
                friendsArr = friends.items.sort(compareNames);
                friendsArr = friendsArr.filter(f => !f.hasOwnProperty('deactivated'));
            }
            if (newFriendsArr.length > 0) {
                renderNewFriendsList();
            }
    
            renderFriendsList();
    
        } catch (e) {
            console.error(e);
        }
    })();


makeDnD([friendsList, filteredList]);

function makeDnD(zones) {
    let currentDrag;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', e => {
            currentDrag = { source: zone, node: e.target }
        });

        zone.addEventListener('dragover', e => {
            e.preventDefault();
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();

            if (currentDrag) {
                if (currentDrag.source !== zone) {
                    const sourceUl = currentDrag.source.id;
                    const DraggableFriendId = currentDrag.node.dataset.id;
                    const li = e.target.closest('.friends__item');
                    const friendsItem = friendsArr.find(f => f.id === Number(DraggableFriendId));
                    const newFriendsItem = newFriendsArr.find(f => f.id === Number(DraggableFriendId));
                    const fullName = currentDrag.node.innerText;

                    if (sourceUl === 'friendList') {
                        newFriendsArr.push(friendsItem);
                        friendsArr = friendsArr.filter(f => f.id !== Number(DraggableFriendId));                       
                        if(isMatching(fullName, filterFilteredList.value)){
                            renderFriendsList(filterFullList.value);
                            renderNewFriendsList(filterFilteredList.value); 

                        } else {
                            renderFriendsList(filterFullList.value);                                      
                        }

                        sortFriendsArrs();                        
                    }
                    if (sourceUl === 'filteredList') {                        
                        friendsArr.push(newFriendsItem);
                        newFriendsArr = newFriendsArr.filter(f => f.id !== Number(DraggableFriendId));
                        if(isMatching(fullName, filterFullList.value)){     
                            renderFriendsList(filterFullList.value);
                            renderNewFriendsList(filterFilteredList.value);
                        } else {
                            renderNewFriendsList(filterFullList.value);
                        }
                        sortFriendsArrs();                        
                    }
                }
                currentDrag = null;
            }
        });
    })
}

filterFullList.addEventListener('keyup', e => {
    renderFriendsList(e.target.value);
});

filterFilteredList.addEventListener('keyup', e => {
    renderNewFriendsList(e.target.value);
});

friendsList.addEventListener('click', e => {
    if (!e.target.classList.contains('plus-icon')) return;
    const li = e.target.closest('.friends__item');
    const id = li.getAttribute('data-id');
    const item = friendsArr.find(f => f.id === Number(id));

    newFriendsArr.push(item);
    friendsArr = friendsArr.filter(f => f.id !== Number(id));
    renderFriendsList(filterFullList.value);
    renderNewFriendsList(filterFilteredList.value);
    sortFriendsArrs();
});

filteredList.addEventListener('click', e => {
    if (!e.target.classList.contains('close-icon')) return;
    const li = e.target.closest('.friends__item');
    const id = li.getAttribute('data-id');
    const item = newFriendsArr.find(f => f.id === Number(id));

    friendsArr.push(item);
    newFriendsArr = newFriendsArr.filter(f => f.id !== Number(id));
    renderFriendsList(filterFullList.value);
    renderNewFriendsList(filterFilteredList.value);
    sortFriendsArrs();
});

saveButton.addEventListener('click', e => {
    localStorage.setItem('friendsArr', JSON.stringify(friendsArr));
    localStorage.setItem('newFriendsArr', JSON.stringify(newFriendsArr));
    alert('Списки друзей сохранены');
});

function renderFriendsList(filter = '') {

    friendsList.innerHTML = '';

    let filteredfriendsArr = friendsArr.filter(f => {
        let fullname = `${f.first_name} ${f.last_name}`;
        return isMatching(fullname, filter);
    });

    friendsList.innerHTML = createFriendslist(filteredfriendsArr);
}

function renderNewFriendsList(filter = '') {
    filteredList.innerHTML = '';
    let filterednewFriendsArr = newFriendsArr.filter(f => {
        let fullname = `${f.first_name} ${f.last_name}`;
        return isMatching(fullname, filter);
    });

    filteredList.innerHTML = createNewFriendslist(filterednewFriendsArr);
}

function sortFriendsArrs() {
    friendsArr.sort(compareNames);
    newFriendsArr.sort(compareNames);
}

