import React, { Component } from "react";
import HomeSlider from "./Home_Slider";
import HomePromotion from "./Home_Promotion";
import CardBlock from "../utils/card_block";

import { connect } from "react-redux";
import {
  getProductsBySell,
  getProductsByArrival
} from "../../actions/products_actions";

class Home extends Component {
  componentDidMount() {
    this.props.dispatch(getProductsBySell());
    this.props.dispatch(getProductsByArrival());
  }

  render() {
    return (
      <div>
        <HomeSlider />
        <CardBlock
          list={this.props.products.bySell}
          title="Best Selling Guitars"
        />
        <HomePromotion />
        <CardBlock list={this.props.products.byArrival} title="New Arrivals" />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    products: state.products
  };
};

export default connect(mapStateToProps)(Home);
