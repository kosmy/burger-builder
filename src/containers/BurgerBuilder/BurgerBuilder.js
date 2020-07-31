import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger'
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {

    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        console.log(this.props)

        axios.get('/ingredients.json')
            .then(response => {
                console.log(response)
                this.setState({ ingredients: response.data });
            })
            .catch(error => {
                this.setState({ error: true })
            })
    }

    purchaseHandler = () => {
        this.setState({ purchasing: true });
    }

    updatePurchaseState(updatedIngredients) {
        const sum = Object.keys(updatedIngredients)
            .map(igKey => {
                return updatedIngredients[igKey]
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        this.setState({ purchasable: sum > 0 })
    }

    addIngredientHandler = (type) => {
        const priceAddition = INGREDIENT_PRICES[type];
        this.setState((prevState, props) => {
            const
                oldCount = prevState.ingredients[type],
                updatedCount = oldCount + 1,
                oldPrice = prevState.totalPrice,
                newPrice = oldPrice + priceAddition,
                updatedIngredients = {
                    ...this.state.ingredients
                };
            updatedIngredients[type] = updatedCount;
            this.updatePurchaseState(updatedIngredients);
            return { totalPrice: newPrice, ingredients: updatedIngredients };
        });
    }

    removeIngredientHandler = (type) => {
        const priceDiff = INGREDIENT_PRICES[type];
        this.setState((prevState, props) => {
            const
                oldCount = prevState.ingredients[type],
                updatedCount = oldCount - 1,
                oldPrice = prevState.totalPrice,
                newPrice = oldPrice - priceDiff,
                updatedIngredients = {
                    ...this.state.ingredients
                };
            if (oldCount <= 0) {
                return;
            }
            updatedIngredients[type] = updatedCount;
            this.updatePurchaseState(updatedIngredients);
            return { totalPrice: newPrice, ingredients: updatedIngredients };
        });
    }

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    }

    purchaseContinueHandler = () => {

        const queryParams = [];

        for (let i in this.state.ingredients) {
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
        }

        queryParams.push('price=' + this.state.totalPrice);
        const queryString = queryParams.join('&');
        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString
        })
    }
    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }
        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

        if (this.state.ingredients) {
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        purchasable={this.state.purchasable}
                        price={this.state.totalPrice}
                        ordered={this.purchaseHandler} />
                </Aux>
            );
            orderSummary = <OrderSummary
                price={this.state.totalPrice}
                ingredients={this.state.ingredients}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} />;
        }
        if (this.state.loading) {
            orderSummary = <Spinner />;
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);