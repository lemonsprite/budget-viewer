// Initial Setup
const form = document.querySelector('form')
const nama = document.querySelector('#nama')
const biaya = document.querySelector('#biaya')
const error = document.querySelector('#error')

// Submit Event
form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    if(nama.value && biaya.value) {
        let data = {
            nama: nama.value.toLowerCase(),
            biaya: parseInt(biaya.value)
        }

        db.collection('budgets').add(data).then(res => {
            nama.value = biaya.value = error.text = "";
        })
    } else {
        error.textContent = "Data tidak boleh kosong."
    }
})