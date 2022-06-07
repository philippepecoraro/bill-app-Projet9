import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
let extension = false;

export default class NewBill {
    constructor({ document, onNavigate, store, localStorage }) {
        this.document = document
        this.onNavigate = onNavigate
        this.store = store
        const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
        formNewBill.addEventListener("submit", this.handleSubmit)
        const file = this.document.querySelector(`input[data-testid="file"]`)
        file.addEventListener("change", this.handleChangeFile)
        this.fileUrl = null
        this.fileName = null
        this.billId = null
        this.formData = new FormData;
        new Logout({ document, localStorage, onNavigate })
    }
    handleChangeFile = e => {
        e.preventDefault()
        const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
        if (file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/png") {
            extension = true;
            const filePath = e.target.value.split(/\\/g)
            this.fileName = filePath[filePath.length - 1]
            const email = JSON.parse(localStorage.getItem("user")).email
            this.formData.append('file', file)
            this.formData.append('email', email)
        } else {
            alert("Veuillez choisir un fichier Image avec une extension .jpg ou .jpeg ou .png");
        }
    }
    handleSubmit = e => {
        e.preventDefault()
        if (extension) {
            console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
            const email = JSON.parse(localStorage.getItem("user")).email
            this.store
                .bills()
                .create({
                    data: this.formData,
                    headers: {
                        noContentType: true
                    }
                })
                .then(({ fileUrl, key }) => {
                    console.log(fileUrl)
                    this.billId = key
                    this.fileUrl = fileUrl
                    const bill = {
                        email,
                        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
                        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
                        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
                        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
                        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
                        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
                        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
                        fileUrl: this.fileUrl,
                        fileName: this.fileName,
                        status: 'pending'
                    }
                    this.updateBill(bill)
                    this.onNavigate(ROUTES_PATH['Bills'])
                }).catch(error => console.error(error))
        } else {
            alert("Veuillez choisir un fichier Image avec une extension .jpg ou .jpeg ou .png");
        }
    }

    // not need to cover this function by tests
    updateBill = (bill) => {
        if (this.store) {
            this.store
                .bills()
                .update({ data: JSON.stringify(bill), selector: this.billId })
                .then(() => {
                    this.onNavigate(ROUTES_PATH['Bills'])
                })
                .catch(error => console.error(error))
        }
    }
}