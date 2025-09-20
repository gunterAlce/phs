// Copyright 
// Mail: 

"use strict;";

var boj = boj || {};

boj.diagram_util = ( function () {

    var cvu = boj.canvas_util;
    var new_mh = cvu.new_mat_hom;

    function $ (selector, el) {
        if (!el) {el = document;}
        return el.querySelector(selector);
    }

    function $$ (selector, el) {
        if (!el) {el = document;}
        return Array.prototype.slice.call(el.querySelectorAll(selector));
    }

    // utilities --------------------------------------------------------------------------------

    function clone_obj( s ) {

        var ik;
        var res;
        var cur;

        if( s instanceof Array ) {
            res = [];
            for( ik = 0; ik < s.length; ik++){
                cur = s[ ik ];
                res[ ik ] = ( cur === null || typeof cur !==  "object" ) ?
                    cur : clone_obj( cur );
            }
        }
        else if( s instanceof Object ){
            res = {};
            for( ik in s ){
                cur = s[ ik ];
                res[ ik ] = ( cur === null || typeof cur !==  "object" ) ?
                    cur : clone_obj( cur );
            }
        }
        else{
            throw new Error("Unable to copy obj! Its type isn't supported.");
        }
        return res;
    }

    function clone( src ){
        if ( typeof src === "undefined" || src === null || typeof src !==  "object" ) { return  src; }
        return clone_obj( src );
    }

    function clone_obj_opt( s ) { // default cfg for option

        var ik;
        var res;
        var cur;

        if( s instanceof Array ) {
            res = [];
            for( ik = 0; ik < s.length; ik++){
                cur = s[ ik ];
                res[ ik ] = ( cur === null || typeof cur !==  "object" ) ?
                    cur : clone_obj( cur );                
            }
        }
        else if( s instanceof Object ){
            res = {};
            for( ik in s ){
                if ( ik === "_OPT_" ){
                    var dummy;
                }
                else {
                    cur = s[ ik ];
                    res[ ik ] = ( cur === null || typeof cur !==  "object" ) ?
                    cur : clone_obj( cur );
                }
            }
        }
        else{
            throw new Error("Unable to copy obj! Its type isn't supported.");
        }
        return res;
    }

    function set_default( s, dst ){ // s is configuration description

        var ik;
        var cur;

        if( s instanceof Array ) {
            for( ik = 0; ik < s.length; ik++){
                cur = s[ ik ];
                if ( cur instanceof Array ){
                    dst[ ik ] = []; set_default( cur, dst[ ik ] );
                }
                else if ( cur instanceof Object ){
                    dst[ ik ] = {}; set_default( cur, dst[ ik ] );
                }
                else{ dst[ ik ] = cur; }
            }
        }
        else if( s instanceof Object ){
            cur = s[ ik ];
            for( ik in s ){
                cur = s[ ik ];
                if ( cur instanceof Array ){
                    dst[ ik ] = []; set_default( cur, dst[ ik ] );
                }
                else if ( cur instanceof Object ){
                    if ("_OPT_" in cur){
                        dst[ ik ] = undefined;
                    }
                    else{
                        dst[ ik ] = {}; set_default( cur, dst[ ik ] );
                    }
                }
                else{ dst[ ik ] = cur; }
            }
        }
        else{
            //alert('error');
            throw new Error("Unable to copy obj! Its type isn't supported.");
        }
    }

    function use_config_error( msg, c, d ){
        console.log( 'ERROR use_config ' + msg,
                     'config: ', JSON.stringify( c ), 'dst: ',JSON.stringify( d ));
    }

    function use_config( s, c, d ){
        //          config, conf_des, dst
        var type_s = s instanceof Array ? 1 :
            s instanceof Object ? 0 : -1;
        var type_c = c instanceof Array ? 1 :
            c instanceof Object ? 0 : -1;
        var type_d = d instanceof Array ? 1 :
            d instanceof Object ? 0 : -1;
        if ( type_s === -1 || type_c === -1 || type_d === -1 ||
             type_s !== type_c || type_d !== type_c ){
            alert( 'ERROR use_config s: ' +  JSON.stringify( s ) +
                   ' c: ' + JSON.stringify( c ) +
                   ' d: ' + JSON.stringify( d ) );
            return;
        }

        var ik;
        var cur_s;
        var cur_c;
        var cur_d;

        if ( type_c === 1 ){ // []
            for( ik = 0; ik < s.length; ik++){
                cur_s = s[ ik ];
                cur_c = c[ ik ];
                cur_d = d[ ik ];
                if( cur_s instanceof Array ) {
                    if ( cur_c instanceof Array ){
                        if ( ! cur_d ){
                            d[ ik ] = [];
                        }
                        use_config( cur_s, cur_c, d[ ik ] );
                    }
                    else{
                        use_config_error( '3', cur_s, cur_c );
                    }
                }
                else if( cur_s instanceof Object ){
                    if ( cur_c instanceof Object ){
                        if ( ! cur_d ){
                            d[ ik ] = {};
                        }
                        use_config( cur_s, cur_c, d[ ik ] );
                    }
                    else {
                        use_config_error( '4', cur_s, cur_c );
                    }
                }
                else{
                    d[ ik ] = cur_s;
                }
            }
        }
        else { // {}
            for( ik in s ){
                if ( ( ik in c ) ){ // only if in desc
                    cur_s = s[ ik ];
                    cur_c = c[ ik ];
                    cur_d = d[ ik ];
                    if ( cur_d === undefined && cur_s !== undefined &&
                         cur_c instanceof Object && "_OPT_" in cur_c ){
                        d[ ik ] = clone_obj_opt( cur_c ); // default cfg for option
                        use_config( cur_s, cur_c, d[ ik ] );
                    }
                    else{
                        if( cur_s instanceof Array ) {
                            if ( cur_c instanceof Array ){
                                if ( ! cur_d ){
                                    d[ ik ] = [];
                                }
                                use_config( cur_s, cur_c, d[ ik ] );
                            }
                            else{
                                use_config_error( '3', cur_s, cur_c );
                            }
                        }
                        else if( cur_s instanceof Object ){
                            if ( cur_c instanceof Object ){
                                if ( ! cur_d ){
                                    d[ ik ] = {};
                                }
                                use_config( cur_s, cur_c, d[ ik ] );
                            }
                            else {
                                use_config_error( '4', cur_s, cur_c );
                            }
                        }
                        else{
                            d[ ik ] = cur_s;
                        }
                    }
                }
            }
        }
    }

    // diagram ===========================================================

    function layout(){
        var cfg = this.cfg;
        var xls = cfg.margin; // x left start
        var xrs = cfg.width - cfg.margin; // x right start
        var yts = cfg.margin; // y top start
        //var ybs = cfg.height - cfg.margin;  // y bottom start
        var ybs = cfg.height;  // y bottom start
        var xl = [ xls, xls, xls ]; // x left
        var xr = [ xrs, xrs, xrs ]; // x right
        var yt = [ yts, yts, yts ]; // y top
        var yb = [ ybs, ybs, ybs ]; // y bottom
        var dx, dy;
        if ( cfg.title ) {
            cfg.title_rec = [ xl[ 0 ], yt[ 0], xr[ 0 ] - xl[ 0 ], cfg.txt_h ];
            dy = cfg.txt_h + cfg.margin;
            yt[ 0 ] += dy;
            yt[ 1 ] += dy;
            yt[ 2 ] += dy;
        }
        if( cfg.axis_yll ){
            dx = cfg.axis_yll.size;
            xl[ 1 ] += dx;
            xl[ 2 ] += dx;
        }
        if( cfg.axis_yl ){
            dx = cfg.axis_yl.size;
            xl[ 2 ] += dx;
        }
        if( cfg.axis_yrr ){
            dx = cfg.axis_yrr.size;
            xr[ 1 ] -= dx;
            xr[ 2 ] -= dx;
        }
        if( cfg.axis_yr ){
            dx = cfg.axis_yr.size;
            xr[ 2 ] -= dx;
        }
        if( cfg.axis_xtt ){
            dy = cfg.axis_xtt.size;
            yt[ 1 ] += dy;
            yt[ 2 ] += dy;
        }
        if( cfg.axis_xt ){
            dx = cfg.axis_xt.size;
            yt[ 2 ] += dy;
        }
        if( cfg.axis_xbb ){
            dy = cfg.axis_xbb.size;
            yb[ 1 ] -= dy;
            yb[ 2 ] -= dy;
        }
        if( cfg.axis_xb ){
            dx = cfg.axis_xb.size;
            yb[ 2 ] -= dx;
        }
        if ( xl[ 2 ] >= xr[ 2 ] ) alert ( 'xl[ 2 ] >= xr[ 2 ]' );
        if ( yt[ 2 ] >= yb[ 2 ] ) alert ( 'yt[ 2 ] >= yb[ 2 ]' );
        cfg.plot_area_rec =
            [ xl[ 2 ], yt[ 2 ], xr[ 2 ] - xl[ 2 ], yb[ 2 ] - yt[ 2 ] ];
        if( cfg.axis_yll ){
            cfg.axis_yll.rec =
                [ xl[ 0 ], yt[ 2 ], xl[ 1 ] - xl[ 0 ], yb[ 2 ] - yt[ 2 ] ];
        }
        if( cfg.axis_yl ){
            cfg.axis_yl.rec =
                [ xl[ 1 ], yt[ 2 ], xl[ 2 ] - xl[ 1 ], yb[ 2 ] - yt[ 2 ] ];
        }
        if( cfg.axis_yrr ){
            cfg.axis_yrr.rec =
                [ xr[ 1 ], yt[ 2 ], xr[ 0 ] - xr[ 1 ], yb[ 2 ] - yt[ 2 ] ];
        }
        if( cfg.axis_yr ){
            cfg.axis_yr.rec =
                [ xr[ 2 ], yt[ 2 ], xr[ 1 ] - xr[ 2 ], yb[ 2 ] - yt[ 2 ]];
        }
        if( cfg.axis_xtt ){
            cfg.axis_xtt.rec =
                [ xl[ 2 ], yt[ 0 ], xr[ 2 ] - xl[ 2 ], yt[ 1 ] - yt[ 0 ] ];
        }
        if( cfg.axis_xt ){
            cfg.axis_xt.rec =
                [ xl[ 2 ], yt[ 1 ], xr[ 2 ] - xl[ 2 ], yt[ 2 ] - yt[ 1 ] ];
        }
        if( cfg.axis_xbb ){
            cfg.axis_xbb.rec =
                [ xl[ 2 ], yb[ 1 ], xr[ 2 ] - xl[ 2 ], yb[ 0 ] - yb[ 1 ] ];
        }
        if( cfg.axis_xb ){
            cfg.axis_xb.rec =
                [ xl[ 2 ], yb[ 2 ], xr[ 2 ] - xl[ 2 ], yb[ 1 ] -yb[ 2 ] ];
        }
    }

    var diagram_cfgdes =
        {
            x_domain : {
                first : 0,
                last : 100,
                tick_inc : 20
            },
            margin : 5,
            txt_h : 20,
            title : {
                _OPT_ : 1,
                txt : 'Diagram title'
            },
            plot_area : {
            },
            axis_xtt : { _OPT_ : 1, size : 20, domain_id : 'x_domain', reverse : true },
            axis_xt : { _OPT_ : 1, size : 20, domain_id : 'x_domain', reverse : true },
            axis_xb : { _OPT_ : 1, size : 20, domain_id : 'x_domain', reverse : false },
            axis_xbb : { _OPT_ : 1, size : 20, domain_id : 'x_domain', reverse : false },
            axis_yll : { _OPT_ : 1, size : 30, domain_id : 'y_domain', reverse : false },
            axis_yl : { _OPT_ : 1, size : 30, domain_id : 'y_domain', reverse : false },
            axis_yr : { _OPT_ : 1, size : 30, domain_id : 'y_domain', reverse : true  },
            axis_yrr : { _OPT_ : 1, size : 30, domain_id : 'y_domain', reverse : true  }
        };

    // diagram object ----------------------------------------------------

    // canpos, position in canvas = [ x, y, size_x, size_y ]
    function new_diagram( canvas, canpos, config ){
        if ( ! canvas ){ return undefined; }
        return new diagram( canvas, canpos, config );
    }

    var subobj_constr = {
        title :  title, axis_xtt : X_axis, axis_xt : X_axis, axis_xb : X_axis,
        axis_xbb : X_axis, axis_yll : Y_axis, axis_yl : Y_axis, axis_yr : Y_axis,
        axis_yrr : Y_axis };
    
    function diagram( _canvas, canpos, config ){ // constructor
        var cx = canpos[ 0 ];
        var cy = canpos[ 1 ];
        var csx = canpos[ 2 ];
        var csy = canpos[ 3 ];
        this.canvas = _canvas;
        this.cfg = {};
        set_default( diagram_cfgdes, this.cfg );
        this.cfg.width = csx;
        this.cfg.height = csy;
        this.subcan = cvu.new_subcanvas( _canvas, cx, cy, csx, csy );
        this.subobj = { plot_area : new plot_area( this ) };
        for ( var obj_id in subobj_constr ){
            this.subobj[ obj_id ] = undefined;
        }
        this.val_domain = {};
        this.value_domain( { x_domain : {}, y_domain : {} } );
        this.pctx_line = {};
        layout.call( this );
        this.subobj.plot_area.update();
        this.config( config);
        return this;
    }

    diagram.prototype.config =
        function ( config ){
            if ( config ){
                use_config( config, diagram_cfgdes, this.cfg );
                layout.call( this );
                subobj_create.call( this );
                do_sub_obj.call( this, function( obj ){ obj.update(); } );
            }
        };

    function subobj_create(){
        for ( var obj_id in this.subobj ){
            if ( ! this.subobj[obj_id] &&
                 this.cfg[obj_id] ){
                this.subobj[obj_id] = new subobj_constr[obj_id]( this, obj_id );
            }
        }
    }

    diagram.prototype.get_ctx =
        function ( ){
            return this.ctx;
        };
    
    diagram.prototype.draw =
        function ( ){
            do_sub_obj.call( this, function( obj ){ obj.draw(); } );
        };
        
    diagram.prototype.clear =
        function ( ){
            this.subcan.clear();
        };

    diagram.prototype.draw_extent = // for test purpose
        function ( ){
            if ( this.subcan ) { this.subcan.draw_extent(); }
            if ( this.subobj.plot_area ) { this.subobj.plot_area.draw_extent(); }
            for ( var obj in this.subobj ){
                this.subobj[ obj ] &&
                    this.subobj[ obj ].port &&
                    this.subobj[ obj ].port.draw_extent();
            }
        };

    // value domain ------------------------------------------------------

    var value_dom_def = { ms : 10, nos : 10, prop : 100 };

    // conf = { vd_id : { vd_conf }, ... }
    // vd_cpnf = { m0 : ?0, step : [ sobj, ... ]
    // sobj = { ms : ?10, nos : ?10, prop : ?100 }
    // ms = step, nos = number of step
    // prop = proportion of vpspace in %
    diagram.prototype.value_domain =
        function ( conf ){
            for ( var vd_id in conf ){
                if ( ! ( vd_id in this.val_domain ) ){
                    this.val_domain[ vd_id ] =
                        { m0 : 0,
                          step : [
                              { ms : 10, nos : 10, prop : 100 }
                          ]
                        };
                }
                var in_obj = conf[ vd_id ];
                var vd_obj = this.val_domain[ vd_id ];
                if ( 'm0' in in_obj ){
                   vd_obj.m0 = in_obj.m0; 
                }
                var in_step = in_obj.step;
                if ( ! in_step ){ continue; }
                var res = [];
                in_step.map(
                    function( obj ){
                        var step = {};
                        for ( var att in value_dom_def ){
                            if( att in obj){
                                step[att] = obj[ att ];
                            }
                            else{
                                step[att] = value_dom_def[ att ];
                            }
                        }
                        res.push( step );
                    }
                );
                vd_obj.step = res;
            }
        };

    // diagram sub_object ===================================================

    function do_sub_obj ( func ){
            for ( var obj in this.subobj ){
                this.subobj[ obj ] &&
                    func( this.subobj[ obj ] );
            }
        }

    function diagram_sub_obj_init( p_parent, p_cfg_id ){
        this.parent = p_parent;
        this.cfg_id = p_cfg_id;
        this.port = p_parent.subcan.new_canport();
        this.update();
    }

    function diagram_sub_obj_port_config( rec ){
        if( rec ){
            this.port.config( rec[ 0 ], rec[ 1 ], rec[ 2 ], rec[ 3 ] );
        }
    }

    // title ------------------------------------------------------
    
    function title( parent ){ // constructor
        diagram_sub_obj_init.call( this, parent, 'title' );
    }

    title.prototype.update =
        function(){
            var cfg = this.parent.cfg;
            this.str = cfg.title.txt;
            var rec = cfg.title_rec;
            this.port.config(  rec[ 0 ], rec[ 1 ], rec[ 2 ], rec[ 3 ] );
        };

    title.prototype.draw =
        function (){
            var ctx = this.port.ctx_port();
            ctx.save();
            ctx.font="15px Arial";
            ctx.fillText(this.str, 100, 15 );
            ctx.restore();
        };

    // coord axis =================================================================

    function text_pos( ctx, quad ){
        if ( this.quad === 1 ){
            ctx.textAlign="center";
            ctx.textBaseline="top";
        }
        else if ( this.quad === 2 ){
            ctx.textAlign="end";
            ctx.textBaseline="middle";
        }
        else if ( this.quad === 3 ){
            ctx.textAlign="center";
            ctx.textBaseline="bottom";
        }
        else{
            ctx.textAlign="start";
            ctx.textBaseline="middle";
        }
    }

    // x_axis ------------------------------------------------------

    function X_axis( parent, cfg_id ){ // constructor
        this.coord = new_coord_vp_mw();
        diagram_sub_obj_init.call( this, parent, cfg_id );
    }

    X_axis.prototype.update =
        function(){
            var cfg_this = this.parent.cfg[ this.cfg_id ];
            this.reverse = cfg_this.reverse;
            var domain = this.parent.val_domain[ cfg_this.domain_id ];
            //var val_f = domain.first;
            //var val_l = domain.last;
            var m0 = domain.m0;
            var nos = domain.step[ 0 ].nos;
            var ms = domain.step[ 0 ].ms;
            var val_f = m0;
            var val_l = m0 + nos * ms;
            var val_inc = ms;
            var nof_step_1 = ( val_l - val_f ) / val_inc;
            var nof_step = Math.floor( nof_step_1 );
            diagram_sub_obj_port_config.call( this, cfg_this.rec );
            var size = this.port.size;
            var sx = size[ 0 ];
            var sy = size[ 1 ];
            var inc = sx / nof_step_1;
            //this.coord.config_mod( [ val_f, [ val_inc, nof_step ] ] );
            this.coord.config_mod_domain( domain );
            this.coord.config_vp( 0, sx );
            if( this.reverse ){
                this.vpt0 = sy;
                this.vpts = -5;
            }
            else{
                this.vpt0 = 0;
                this.vpts = 5;
            }
        };

    X_axis.prototype.draw =
        function (){
            var t0 = this.vpt0;
            var ts = this.vpts;
            var coord = this.coord;
            var vp = coord.vparr();
            var m = coord.marr();
            var ctx = this.port.ctx_port();
            ctx.save();
            ctx.beginPath();
            ctx.moveTo( coord.vp0, t0 );
            ctx.lineTo( coord.vpn, t0 );
            for ( var ix = 0; ix < vp.length ; ix ++){
                ctx.moveTo( vp[ ix ], t0  );
                ctx.lineTo( vp[ ix ], t0 + ts );
            }
            ctx.stroke();
            ctx.textAlign="center";
            if( this.reverse ){
                ctx.textBaseline="bottom";
            }
            else{
                ctx.textBaseline="top";
            }
            for ( ix = 0; ix < vp.length ; ix ++){
                ctx.fillText( m[ ix ], vp[ ix ], t0 + ts);
            }
            ctx.restore();
        };

    // y_axis ------------------------------------------------------

    function Y_axis( parent, cfg_id ){ // constructor
        this.coord = new_coord_vp_mw();
        diagram_sub_obj_init.call( this, parent, cfg_id );
    }

    Y_axis.prototype.update =
        function(){
            var cfg_this = this.parent.cfg[ this.cfg_id ];
            this.reverse = cfg_this.reverse;
            var domain = this.parent.val_domain[ cfg_this.domain_id ];
            //var val_f = domain.first;
            //var val_l = domain.last;
            //var val_inc = domain.tick_inc;
            var m0 = domain.m0;
            var nos = domain.step[ 0 ].nos;
            var ms = domain.step[ 0 ].ms;
            var val_f = m0;
            var val_l = m0 + nos * ms;
            var val_inc = ms;
            var nof_step_1 = ( val_l - val_f ) / val_inc;
            var nof_step = Math.floor( nof_step_1 );
            diagram_sub_obj_port_config.call( this, cfg_this.rec );
            var size = this.port.size;
            var sx = size[ 0 ];
            var sy = size[ 1 ];
            var inc = sy / nof_step_1;
            //this.coord.config_mod( [ val_f, [ val_inc, nof_step ] ] );
            this.coord.config_mod_domain( domain );
            this.coord.config_vp( sy, 0 );
            if( this.reverse ){
                this.vpt0 = 0;
                this.vpts = 5;
            }
            else{
                this.vpt0 = sx;
                this.vpts = -5;
            }
        };

    Y_axis.prototype.draw =
        function (){
            var t0 = this.vpt0;
            var ts = this.vpts;
            var coord = this.coord;
            var vp = coord.vparr();
            var m = coord.marr();
            var ctx = this.port.ctx_port();
            ctx.save();
            ctx.beginPath();
            ctx.moveTo( t0, coord.vp0 );
            ctx.lineTo( t0, coord.vpn );
            for ( var ix = 0; ix < vp.length ; ix ++){
                ctx.moveTo( t0, vp[ ix ]);
                ctx.lineTo( t0 + ts, vp[ ix ]);
            }
            ctx.stroke();
            ctx.textBaseline="middle";
            if( this.reverse ){
                ctx.textAlign="start";
            }
            else{
                ctx.textAlign="end";
            }
            for ( ix = 0; ix < vp.length ; ix ++){
                ctx.fillText( m[ ix ], t0 + ts, vp[ ix ]);
            }
            ctx.restore();
        };

    // plot_area ------------------------------------------------------

    function plot_area( parent ){ // constructor
        diagram_sub_obj_init.call( this, parent, 'plot_area' );
    }

    plot_area.prototype.update =
        function(){
            var cfg = this.parent.cfg;
            diagram_sub_obj_port_config.call( this, cfg.plot_area_rec );
            for ( var obj in this.plot_domain ){
                plot_line_update.call( this.plot_domain[ obj ] );
            }
        };

    function draw_coord_pos( ctx, x, y ){
        ctx.fillText(x + ', ' + y, x, y);
    }

    plot_area.prototype.draw_extent =
        function (){
            this.port.draw_extent();
        };

    plot_area.prototype.draw =
        function (){
            //var ctx = this.port.ctx_port();
            //ctx.save();
            //ctx.restore();
        };

    // coordinate transformation from model to view port ============================

    function new_coord_vp_mw(){
        return new Coord_vp_mw();
    }

    function Coord_vp_mw(){ // constructor
    }

    // (vp|m)(0|s|n)
    // vp = view port, m = model
    // 0 = first, n = last, s=step
    //
    // nos = number of step
    // pro = 100 * proportion used of the vp space

    Coord_vp_mw.prototype.config_mod =
        // maoa  = [ m0,  [ ms, nso, pro?100 ], ... ]
        function ( maoa ){
            var nostep = maoa.length - 1;
            var m0 = maoa[0];
            this.m0 = m0;
            var ta = []; // this.mstep
            for ( var ix = 1; ix <= nostep; ix++){
                var arr = maoa[ ix ];
                var ms = arr[ 0 ];
                var nos = arr[ 1 ];
                var pro  = arr[ 2 ];
                if ( ! pro ){
                    pro = 100 / nostep;
                }
                pro = pro | 0;
                ta.push( [ m0, ms, nos, pro ] );
                m0 += ms * nos;
            }
            this.maoa = ta;
            this.mn = m0;
            this.update();
        };

    Coord_vp_mw.prototype.config_mod_domain =
        function ( vdobj ){
            var m0 = vdobj.m0;
            this.m0 = m0;
            var sarr = vdobj.step;
            var nostep = sarr.length;
            var ta = []; // this.mstep
            for ( var ix = 0; ix < nostep; ix++){
                var obj = sarr[ ix ];
                var ms = obj.ms;
                var nos = obj.nos;
                var prop  = obj.prop;
                if ( ! prop ){
                    prop = 100 / nostep;
                }
                prop = prop | 0;
                ta.push( [ m0, ms, nos, prop ] );
                m0 += ms * nos;
            }
            this.maoa = ta;
            this.mn = m0;
            this.update();
        };

    Coord_vp_mw.prototype.config_vp =
        function ( vp0, vpn ){
            this.vp0 = vp0 | 0;
            this.vpn_conf = vpn | 0;
            this.update();
        };

    Coord_vp_mw.prototype.update =
        function (){
            var maoa = this.maoa;
            if ( ! maoa ) return;
            var vp0 = this.vp0;
            if ( vp0 === undefined ) return;
            var vprange = this.vpn_conf - vp0;
            var vpstep = []; // this.vpstep --------
            for ( var ix = 0; ix < maoa.length; ix++){
                var arr = maoa[ ix ];
                var nos = arr[ 2 ];
                var pro = arr[ 3 ];
                var vps = vprange * pro / 100;
                vps = vps / nos;
                vps = vps | 0;
                vpstep.push( [ vp0, vps ] );
                vp0 += vps * nos;
            }
            this.vpstep = vpstep;
            this.vpn = vp0;
            var m2vparr = []; // this.m2vparr ------------
            var vpn, mn;
            for ( ix = 0; ix < maoa.length; ix++){
                var marr = maoa[ ix + 1 ];
                if ( marr ){
                    mn = marr[ 0 ];
                    vpn = vpstep[ ix + 1 ][ 0 ];
                }
                else{
                    mn = this.mn;
                    vpn = this.vpn;
                }
                vp0 = vpstep[ ix ][ 0 ];
                marr = maoa[ ix ];
                m0 = marr[ 0 ];
                var mlow = m0;
                var mhigh = mn;
                if ( mlow > mhigh ){
                    mlow = mn;
                    mhigh = m0;
                }
                var rvpm = ( vpn - vp0 ) / ( mn - m0 );
                m2vparr.push( [ mlow, mhigh, m0, vp0, rvpm ] );
            }
            this.m2vparr = m2vparr;
        };

    Coord_vp_mw.prototype.vp_m =
        function ( m ){
            var m2varr = this.m2vparr;
            for ( var ix = 0; ix < m2varr.length; ix++ ){
                var arr = m2varr[ ix ];
                if ( m >= arr[ 0 ] && m <= arr[ 1 ] ){
                    var vp = ( m - arr[ 2 ] )  * arr[ 4 ] + arr[ 3 ];
                    return vp;
                }
            }
            return NaN;
        };

    Coord_vp_mw.prototype.vp_m_arr =
        function ( marr ){
            var that = this;
            var res = [];
            marr.map(
                function( m ){
                    res.push( that.vp_m( m ) );
                }
            );
            return res;
        };

    Coord_vp_mw.prototype.vparr =
    function (){
        var maoa = this.maoa;
        if ( ! maoa ) return undefined;
        var vpstep = this.vpstep;
        if ( ! vpstep ) return undefined;
        var res = [];
        var vp0;
        for ( var ix = 0; ix < maoa.length; ix++ ){
            var arr = vpstep[ ix ];
            vp0 = arr[ 0 ];
            var vps = arr[ 1 ];
            var nos = maoa[ ix ][ 2 ];
            while ( nos > 0 ){
                res.push( vp0 );
                vp0 += vps;
                nos--;
            }
        }
        res.push( vp0 );
        return res;
    };

    Coord_vp_mw.prototype.marr =
        function (){
            var maoa = this.maoa;
            if ( ! maoa ) return undefined;
            var res = [];
            var m0;
            for ( var ix = 0; ix < maoa.length; ix++ ){
                var arr = maoa[ ix ];
                m0 = arr[ 0 ];
                var ms = arr[ 1 ];
                var nos = arr[ 2 ];
                while ( nos > 0 ){
                    res.push( m0 );
                    m0 += ms;
                    nos--;
                }
            }
            res.push( m0 );
            return res;
        };

    // plot line ------------------------------------------------------

    diagram.prototype.plot_line =
        function ( id, cfg_obj ){
            var pctx = this.pctx_line[ id ];
            if ( ! pctx ){
                pctx = new_plot_line ( id, this, cfg_obj );
                this.pctx_line[ id ] = pctx;
            }
            else{
                pctx.config( cfg_obj );
            }
            return pctx;
        };

    var plot_line_cfgdes = {
        x_domain_id : 'x_domain',
        y_domain_id : 'y_domain',
        strokeColor : 'rgb(0,255,0)'
    };
    
    function new_plot_line ( id, diagram, config ){
            return new Plot_line( id, diagram, config );
    }

    function Plot_line( _id, _diagram, config){ // constructor
        this.id = _id;
        this.diagram = _diagram;
        var plot_area = this.diagram.subobj.plot_area;
        this.port = plot_area.port.new_canport();
        this.cfg = {};
        set_default( plot_line_cfgdes, this.cfg );
        if ( config ){
            this.config( config );
        }
        else{ plot_line_update.call( this ); }
    }

    Plot_line.prototype.config =
        function ( config ){
            if ( config ){
                use_config( config, plot_line_cfgdes, this.cfg );
                plot_line_update.call( this );
            }
        };
    
    function plot_line_update(){
    }
    
    Plot_line.prototype.draw =
        function (xyc_arr, str_color ){
            var mx_arr = [];
            var my_arr = [];
            xyc_arr.map(
                function( xy ){
                    mx_arr.push( xy[ 0 ] );
                    my_arr.push( xy[ 1 ] );
                }
            );
            if ( ! str_color ){
                str_color = this.cfg.strokeColor;
            }
            var vp_size = this.diagram.subobj.plot_area.port.size;
            var x_vd_id = this.cfg.x_domain_id; // x
            var x_domain = this.diagram.val_domain[ x_vd_id ];
            var xcoord = new_coord_vp_mw();
            xcoord.config_mod_domain( x_domain );
            xcoord.config_vp( 0, vp_size[ 0 ] );
            var vpx_arr = xcoord.vp_m_arr( mx_arr );
            var y_vd_id = this.cfg.y_domain_id; // y
            var y_domain = this.diagram.val_domain[ y_vd_id ];
            var ycoord = new_coord_vp_mw();
            ycoord.config_mod_domain( y_domain );
            ycoord.config_vp( vp_size[ 1 ], 0 );                                     
            var vpy_arr = ycoord.vp_m_arr( my_arr );
            var plot_area = this.diagram.subobj.plot_area;
            var ctx = plot_area.port.ctx_port();
            ctx.save();
            ctx.beginPath();
            ctx.moveTo( vpx_arr[ 0 ], vpy_arr[ 0 ] );
            for( var ix = 1; ix < vpx_arr.length; ++ix ){
                ctx.lineTo( vpx_arr[ ix ], vpy_arr[ ix ] );
            }
            ctx.strokeStyle = str_color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        };

    Plot_line.prototype.draw_xarr_yarr =
        function ( mx_arr, my_arr, str_color ){
            if ( ! str_color ){
                str_color = this.cfg.strokeColor;
            }
            var vp_size = this.diagram.subobj.plot_area.port.size;
            var x_vd_id = this.cfg.x_domain_id; // x
            var x_domain = this.diagram.val_domain[ x_vd_id ];
            var xcoord = new_coord_vp_mw();
            xcoord.config_mod_domain( x_domain );
            xcoord.config_vp( 0, vp_size[ 0 ] );
            var vpx_arr = xcoord.vp_m_arr( mx_arr );
            var y_vd_id = this.cfg.y_domain_id; // y
            var y_domain = this.diagram.val_domain[ y_vd_id ];
            var ycoord = new_coord_vp_mw();
            ycoord.config_mod_domain( y_domain );
            ycoord.config_vp( vp_size[ 1 ], 0 );                                     
            var vpy_arr = ycoord.vp_m_arr( my_arr );
            var plot_area = this.diagram.subobj.plot_area;
            var ctx = plot_area.port.ctx_port();
            ctx.save();
            ctx.beginPath();
            ctx.moveTo( vpx_arr[ 0 ], vpy_arr[ 0 ] );
            for( var ix = 1; ix < vpx_arr.length; ++ix ){
                ctx.lineTo( vpx_arr[ ix ], vpy_arr[ ix ] );
            }
            ctx.strokeStyle = str_color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        };

    Plot_line.prototype.draw_grid =
        function ( str_color ){
            if ( ! str_color ){
                str_color = 'rgb(128,128,128)';
            }
            var vp_size = this.diagram.subobj.plot_area.port.size;
            var x_vd_id = this.cfg.x_domain_id; // x
            var x_domain = this.diagram.val_domain[ x_vd_id ];
            var xcoord = new_coord_vp_mw();
            xcoord.config_mod_domain( x_domain );
            xcoord.config_vp( 0, vp_size[ 0 ] );
            var vpx_arr = xcoord.vparr();
            var y_vd_id = this.cfg.y_domain_id; // y
            var y_domain = this.diagram.val_domain[ y_vd_id ];
            var ycoord = new_coord_vp_mw();
            ycoord.config_mod_domain( y_domain );
            ycoord.config_vp( vp_size[ 1 ], 0 );                                     
            var vpy_arr = ycoord.vparr();
            var plot_area = this.diagram.subobj.plot_area;
            var ctx = plot_area.port.ctx_port();
            ctx.save();
            ctx.beginPath();
            var x0 = vpx_arr[ 0 ];
            var xn = vpx_arr[ vpx_arr.length - 1 ];
            var y0 = vpy_arr[ 0 ];
            var yn = vpy_arr[ vpy_arr.length - 1 ];
            for( var ix = 1; ix < vpx_arr.length; ++ix ){
                ctx.moveTo( vpx_arr[ ix ], y0 );
                ctx.lineTo( vpx_arr[ ix ], yn );
            }
            for( ix = 1; ix < vpy_arr.length; ++ix ){
                ctx.moveTo( x0, vpy_arr[ ix ]);
                ctx.lineTo( xn, vpy_arr[ ix ] );
            }
            ctx.strokeStyle = str_color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        };

    // Reveal public pointers to 
    // private functions and properties
    return{
        new_diagram : new_diagram
    };
})();    
