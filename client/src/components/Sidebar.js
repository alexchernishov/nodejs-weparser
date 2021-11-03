import React from 'react';
import PropTypes from 'prop-types';
import {
    NavLink
} from 'react-router-dom';
import {connect} from "react-redux";
import $ from 'jquery';
window.jQuery = $;
window.$ = $;
global.jQuery = $;

class Sidebar extends React.Component {

    componentDidMount(){
        // Toggle the side navigation
        $(document).on("click","#sidebarToggle",function(e) {
            e.preventDefault();
            $("body").toggleClass("sidebar-toggled");
            $(".sidebar").toggleClass("toggled");
        });

        // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
        $(document).on('mousewheel DOMMouseScroll wheel','body.fixed-nav .sidebar', function(e) {
            if (window.width() > 768) {
                var e0 = e.originalEvent,
                    delta = e0.wheelDelta || -e0.detail;
                this.scrollTop += (delta < 0 ? 1 : -1) * 30;
                e.preventDefault();
            }
        });

        // Scroll to top button appear
        $(document).scroll(function() {
            var scrollDistance = $(this).scrollTop();
            if (scrollDistance > 100) {
                $('.scroll-to-top').fadeIn();
            } else {
                $('.scroll-to-top').fadeOut();
            }
        });
        // Smooth scrolling using jQuery easing
        $(document).on('click', 'a.scroll-to-top', function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: ($($anchor.attr('href')).offset().top)
            }, 1000);
            event.preventDefault();
        });
    }

    render(){
        const {isAuthenticated} = this.props.auth;
        return (
            isAuthenticated ?
            <ul className="sidebar navbar-nav">
                <li className="nav-item">
                    <NavLink exact={true} className="nav-link" activeClassName="active" to="/">
                        <i className="fa fa-fw fa-tachometer"/>
                        <span>Админпанель</span>
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink  className="nav-link"  activeClassName="active" to="/main">
                        <i className="fa fa-fw fa-table"/>
                        <span>Главная</span></NavLink>
                </li>
                <li className="nav-item">
                    <NavLink exact={true} className="nav-link" activeClassName="active" to="/our">
                        <i className="fa fa-fw fa-table"/>
                        <span>Товары отсутствующие на сайтах конкурентов</span></NavLink>
                </li>
                <li className="nav-item">
                    <NavLink exact={true} className="nav-link" activeClassName="active" to="/their">
                        <i className="fa fa-fw fa-table"/>
                        <span>Товары отсутствующие на сайте {this.props.domain.site}</span></NavLink>
                </li>
                <li className="nav-item">
                    <NavLink exact={true} className="nav-link" activeClassName="active" to="/sku-mapping">
                        <i className="fa fa-fw fa-table"/>
                        <span>Таблица соответствий идентификаторов</span></NavLink>
                </li>
                <li className="nav-item">
                    <NavLink exact={true} className="nav-link" activeClassName="active" to="/parse-count">
                        <i className="fa fa-fw fa-table"/>
                        <span>Статистика парсинга</span></NavLink>
                </li>
            </ul>
                : ''
        )
    }

}
Sidebar.propTypes = {
    auth: PropTypes.object.isRequired,
    domain: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    domain:state.domain
})
export default connect(mapStateToProps, null, null,{
    pure: false
})(Sidebar);