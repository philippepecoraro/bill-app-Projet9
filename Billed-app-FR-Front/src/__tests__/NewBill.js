/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import mockStore from "../__mocks__/store"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)

describe('Given I am connected as Employee and I am on Bill page and I click on NewBill page', () => {
    describe('When I click on sent button', () => {
        test('I should be sent on Bill page', () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee', email: "a@a"
            }))
            document.body.innerHTML = NewBillUI()
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
            const store = null
            const newbill = new NewBill({
                document, onNavigate, store, localStorage: window.localStorage
            })

            const sentButton = screen.getByTestId("btn-send-bill-n")
            const handleSubmit = jest.fn((e) => newbill.handleSubmit(e))
            sentButton.addEventListener("click", handleSubmit)
            fireEvent.click(sentButton)

            expect(handleSubmit).toHaveBeenCalled()
        })
    })

    describe('When a click on choose button', () => {
        test('I should be sent on choose file window', () => {
            document.body.innerHTML = NewBillUI()
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
            const store = null
            const newbill = new NewBill({
                document, onNavigate, store, localStorage: window.localStorage
            })
            const fileInput = screen.getByTestId('file')
            const handleChangeFile = jest.fn((e) => newbill.handleChangeFile(e))
            fileInput.addEventListener('change', handleChangeFile)
            fireEvent.change(fileInput, {
                target: {
                    files: [
                        new File([''], 'note-de-frais.png', {
                            type: 'image/png'
                        })
                    ]
                }
            })
            fireEvent.change(fileInput, {
                target: {
                    files: [
                        new File([''], 'note-de-frais.txt', {
                            type: 'text/plain'
                        })
                    ]
                }
            })
            expect(handleChangeFile).toHaveBeenCalled()

        })
    })
})

describe('Given I am connected as Employee and I am on Bill page and I click on NewBill page', () => {
    describe('When I click on sent button and NewBill form fully completed', () => {
        test('Then sent new bill to API POST', async () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee', email: "a@a"
            }))
            document.body.innerHTML = NewBillUI()
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }

            const newbill = new NewBill({
                document, onNavigate, store: mockStore, localStorage: window.localStorage
            })

            const sentButton = screen.getByTestId("btn-send-bill-n")
            const onHandleSubmit = jest.spyOn(newbill, 'handleSubmit')
            sentButton.addEventListener('change', onHandleSubmit)
            fireEvent.change(screen.queryByTestId('expense-type'), { target: { option: 'Transports' } })
            fireEvent.change(screen.queryByTestId('expense-name'), { target: { value: 'Vol Lyon Londres' } })
            fireEvent.change(screen.queryByTestId('datepicker'), { target: { value: '2004-04-04' } })
            fireEvent.change(screen.queryByTestId('amount'), { target: { value: 200 } })
            fireEvent.change(screen.queryByTestId('vat'), { target: { value: 70 } })
            fireEvent.change(screen.queryByTestId('pct'), { target: { value: 20 } })
            fireEvent.change(screen.queryByTestId('commentary'), { target: { value: 'Air France' } })

            fireEvent.click(sentButton)

            const contentType = screen.queryByTestId('expense-type')
            expect(contentType).toBeTruthy()
            expect(contentType.option).toBe('Transports')

            const contentName = screen.queryByTestId('expense-name')
            expect(contentName).toBeTruthy()
            expect(contentName.value).toBe('Vol Lyon Londres')

            const contentDate = screen.queryByTestId('datepicker')
            expect(contentDate).toBeTruthy()
            expect(contentDate.value).toBe('2004-04-04')

            const contentAmount = screen.queryByTestId('amount')
            expect(contentAmount).toBeTruthy()
            expect(contentAmount.value).toBe('200')

            const contentVat = screen.queryByTestId('vat')
            expect(contentVat).toBeTruthy()
            expect(contentVat.value).toBe('70')

            const contentPct = screen.queryByTestId('pct')
            expect(contentPct).toBeTruthy()
            expect(contentPct.value).toBe('20')

            const contentCommentary = screen.queryByTestId('commentary')
            expect(contentCommentary).toBeTruthy()
            expect(contentCommentary.value).toBe('Air France')

            expect(onHandleSubmit).toHaveBeenCalled

        })
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills")
                Object.defineProperty(
                    window,
                    'localStorage',
                    { value: localStorageMock }
                )
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Admin',
                    email: "a@a"
                }))
                const root = document.createElement("div")
                root.setAttribute("id", "root")
                document.body.appendChild(root)
                router()
            })

            test("fetches bills from an API and fails with 404 message error", async () => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }
                })
                window.onNavigate(ROUTES_PATH.Dashboard)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })
            test("fetches messages from an API and fails with 500 message error", async () => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }
                })

                window.onNavigate(ROUTES_PATH.Dashboard)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})