document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('itemForm');
    const itemsContainer = document.getElementById('room-list');
    let editedItemId = null; // Variável para armazenar o ID do item em edição

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (editedItemId) {
            updateItem(); // Se há um item em edição, atualiza-o ao submeter o formulário
        } else {
            addItem(); // Caso contrário, adiciona um novo item
        }
    });

    const addItem = () => {
        const name = document.getElementById('name').value;
        const value = document.getElementById('price').value;
        const link = document.getElementById('link').value;
        const room = document.getElementById('room').value;
        const priority = document.getElementById('priority').value;

        fetch('/addItem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, value, link, room, priority, purchased: false })
        }).then(() => {
            renderItems();
            form.reset();
        }).catch(error => console.error('Error adding item:', error));
    };

    const removeItem = (id) => {
        fetch('/removeItem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        }).then(() => {
            const itemElement = document.querySelector(`li[data-id="${id}"]`);
            if (itemElement) {
                itemElement.remove();
                if (editedItemId === id) {
                    editedItemId = null; // Limpa o ID do item em edição se o item removido estava sendo editado
                }
                updateTotals();
            }
        }).catch(error => console.error('Error removing item:', error));
    };

    const togglePurchased = (id, purchased) => {
        fetch('/togglePurchased', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, purchased: !purchased })
        }).then(() => {
            const itemElement = document.querySelector(`li[data-id="${id}"]`);
            if (itemElement) {
                itemElement.classList.toggle('item-checked');
                itemElement.querySelector('input[type="checkbox"]').checked = !purchased;

                updateTotals();
            }
        }).catch(error => console.error('Error updating item:', error));
    };

    const editItem = (id) => {
        editedItemId = id;
        const itemId = id;
    
        document.getElementById('name').value = document.getElementById(`name-${itemId}`).textContent.trim();
        document.getElementById('price').value = document.getElementById(`value-${itemId}`).textContent.replace('R$ ', '');
        document.getElementById('link').value = document.getElementById(`link-${itemId}`).value;
        document.getElementById('room').value = document.getElementById(`room-${itemId}`).value;
        document.getElementById('priority').value = document.getElementById(`priority-${itemId}`).value;
    };

    const updateItem = () => {
        const name = document.getElementById('name').value;
        const value = document.getElementById('price').value;
        const link = document.getElementById('link').value;
        const room = document.getElementById('room').value;
        const priority = document.getElementById('priority').value;

        fetch('/updateItem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: editedItemId, name, value, link, room, priority })
        }).then(() => {
            renderItems();
            form.reset();
            editedItemId = null;
        }).catch(error => console.error('Error updating item:', error));
    };

    const renderItems = () => {
        itemsContainer.innerHTML = '';
        const rooms = ['cozinha', 'sala', 'quarto', 'banheiro', 'escritorio'];
        let totalGeral = 0;

        fetch('/getItems').then(response => response.json()).then(items => {
            rooms.forEach(room => {
                const roomItems = items.filter(item => item.room === room);
                if (roomItems.length > 0) {
                    const roomDiv = document.createElement('div');
                    roomDiv.className = 'room-section';
                    roomDiv.innerHTML = `<h2>${room.charAt(0).toUpperCase() + room.slice(1)}</h2>`;
                    const itemList = document.createElement('ul');
                    itemList.className = 'item-list';
                    let subtotalRoom = 0;

                    roomItems.forEach(item => {
                        const itemDiv = document.createElement('li');
                        itemDiv.className = 'item' + (item.purchased ? ' item-checked' : '');
                        itemDiv.dataset.id = item.id;
                        const itemNameClass = item.priority === 'sim' ? 'high-priority' : 'low-priority';
                        itemDiv.innerHTML = `
                            <label>
                                <input type="checkbox" id="checkbox-${item.id}" onchange="togglePurchased('${item.id}', ${item.purchased})" ${item.purchased ? 'checked' : ''}>
                            </label>&emsp;    
                            <a href="${item.link}" class="link" target="_blank"><span class="name ${itemNameClass}" id="name-${item.id}">${item.name}</span></a>
                            
                            <span class="value" id="value-${item.id}">R$ ${item.value}</span>&emsp;   
                            <button class="btn btn-primary btn-edit-item" style="font-size: 10px;" onclick="editItem('${item.id}')"><i class="fas fa-pencil-alt"></i></button>
                            <button class="btn btn-danger btn-remove-item" style="font-size: 10px;" onclick="removeItem('${item.id}')"><i class="fas fa-trash"></i></button>
                            <input type="hidden" id="room-${item.id}" value="${item.room}">
                            <input type="hidden" id="priority-${item.id}" value="${item.priority}">
                            <input type="hidden" id="link-${item.id}" value="${item.link}">

                        `;
                        itemList.appendChild(itemDiv);

                        subtotalRoom += parseFloat(item.value);
                    });

                    roomDiv.appendChild(itemList);
                    itemsContainer.appendChild(roomDiv);

                    const subtotalDiv = document.createElement('div');
                    subtotalDiv.innerHTML = `<strong>Subtotal: R$ ${subtotalRoom.toFixed(2)}</strong>`;
                    itemsContainer.appendChild(subtotalDiv);

                    totalGeral += subtotalRoom;
                }
            });

            const totalDiv = document.createElement('div');
            totalDiv.innerHTML = `<hr style="background-color:white"><br><h4>Total: R$ ${totalGeral.toFixed(2)}</h3>`;
            itemsContainer.appendChild(totalDiv);
        }).catch(error => console.error('Error fetching items:', error));
    };

    window.togglePurchased = togglePurchased;
    window.removeItem = removeItem;
    window.editItem = editItem; // Torna a função editItem acessível globalmente
    window.updateItem = updateItem; // Torna a função updateItem acessível globalmente
    renderItems();
});
