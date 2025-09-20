// Copyright Testing to move code
// Mail: 

"use strict;";
var boj = boj || {};

boj.PHS_run_sim = ( function () {

    var phs  = boj.PHS;
    var pdo  = boj.par_data_object;
    var par_swarm_sim = phs.par_swarm_sim;
    var par_swarm_step = phs.par_swarm_step;
    var dtab = boj.data_table_obj;
    var diu = boj.diagram_util;

    var parref = par_swarm_sim.new_parref( par_swarm_step );
    var par_get = parref.get_value_func();
    var par_set = parref.set_value_func();

    // run simulation object ===============================================
    
    function new_run_sim(){
        return new run_sim();
    }
    
    function run_sim(){ // constructor
    }

    /*
    var config_id = [];

    run_sim.prototype.config =
        function( config ){
            var self = this;
            config_id.map(
            function( id ){ self[ id ] = config[ id ]; }
            );
        };
    */

    // configuartion of log data and tables =================================
    
    // phs input parameter --------------------------------------------------

    var sim_inp_pid = []; // [ pid, ... ]

    var sim_inp_tab_spec =
        [
            [ 'accl', null, 0 ], [ 'drink', null, 0 ], [ 'height', null, 2 ],
            [ 'mass', null, 2 ], [ 'sim_mod', null, 0 ]
        ];
    
    sim_inp_tab_spec.map(
        function( arr ){
            sim_inp_pid.push( arr[ 0 ]);
        }
    );

    var step_inp_pid = []; // [ pid, ... ]

    var step_inp_tab_spec =
        [
            [ 'time', 'time', 0 ], [ 'post', 'post', 0 ], [ 'Tair', 'Tair', 1 ],
            [ 'Pw', 'Pw_air', 1 ], [ 'Trad', 'Trad', 1 ], [ 'v_air', 'v_air', 1 ],
            [ 'Met', 'Met', 0 ], [ 'Icl', 'Icl', 2 ], [ 'im_st', 'im_st', 2 ],
            [ 'fAref', 'fAref', 2 ], [ 'Fr', 'Fr', 2 ], [ 'w_dir', 'walk_dir', 0, 'nan' ],
            [ 'v_wal', 'v_walk', 1, 'nan' ], [ 'work', 'work', 0 ]
        ];

    step_inp_tab_spec.map(
        function( arr ){
            step_inp_pid.push( arr[ 1 ] );
        }
    );

    var step_log_pid = []; // [ pid, ... ]

    var step_log_tab_spec =
        [
            [ 'time', null, 0 ], [ 'Tcreq', null, 2 ], [ 'Tsk', null, 2 ],
            [ 'SWg', null, 2 ], [ 'SWtotg', null, 0 ], [ 'Tcr', null, 2 ],
            [ 'Tre', null, 2 ], [ 'Tcl', null, 2 ], [ 'SW', null, 0 ],
            [ 'Epre', null, 0 ], [ 'SWreq', null, 0 ], [ 'SWmax', null, 0 ]
        ];

    step_log_tab_spec.map(
        function( arr ){
            step_log_pid.push( arr[ 0 ]);
        }
    );

    // phs simulation result --------------------------------------------------

    var sim_res_pid = [];  // [ pid, ... ]

    var sim_res_tab_spec =
        [
            [ 'time', 'time', 0 ],
            [ 'Tre', 'Tre', 3 ],
            [ 'D_Tre', 'D_Tre', 0 ],
            [ 'SWtotg', 'SWtotg', 0 ],
            [ 'Dwl50', 'Dwl50', 0 ],
            [ 'Dwl95', 'Dwl95', 0 ]
        ];

    sim_res_tab_spec.map(
        function( arr ){
            sim_res_pid.push( arr[ 0 ]);
        }
    );

    // phs simulation result target ----------------------------------------------

    var sim_target_pid = [];  // [ pid, ... ]
    var sim_target_pid_default = [];

    var sim_target_tab_spec =
        [
            [ 'time', 'time', 0 ],
            [ 'Tre', 'Tre', 3 ],
            [ 'D_Tre', 'D_Tre', 0 ],
            [ 'SWtotg', 'SWtotg', 0 ],
            [ 'Dwl50', 'Dwl50', 0 ],
            [ 'Dwl95', 'Dwl95', 0 ]
        ];

    sim_target_tab_spec.map(
        function( arr ){
            sim_target_pid.push( arr[ 0 ] );
            sim_target_pid_default.push( undefined );
        }
    );

    // data as html table ==========================================================

    // simulation input ------------------------------------------------------------

    function sim_inp_dtab_column( tab ){
        sim_inp_tab_spec.map(
            function( arr ){
                if ( arr[ 3 ] === 'nan' ){
                    tab.add_column_nan(
                        arr[ 0 ], arr[ 1 ], arr[ 2 ] );
                }
                else{
                    tab.add_column.apply( tab, arr );
                }
            }
        );
    }

    function sim_inp_dtab_obj(){
        var tab = dtab.new_data_table();
        sim_inp_dtab_column( tab );
        tab.html_target_id( 'sim_inparam_sim' );
        return tab;
    }

    function sim_inp_tab_fill(){
        if ( ! this.sim_inp_tab ){
            this.sim_inp_tab = sim_inp_dtab_obj();
        }
        var tab = this.sim_inp_tab;
        var log = this.run_log;
        var run = log [ log.length -1 ];
        tab.data_in_row( [ run[ 1 ] ] );
    }

    run_sim.prototype.sim_inp_tab_to_html =
        function( node, append ){
            sim_inp_tab_fill.call( this );
            var tab = this.sim_inp_tab;
            tab.to_html_node( node, append );
        };

    run_sim.prototype.sim_inp_tab_to_csv =
        function(){
            sim_inp_tab_fill.call( this );
            var tab = this.sim_inp_tab;
            return tab.to_csv();
        };

    // step input ------------------------------------------------------------

    function step_inp_dtab_column( tab, notime ){
        step_inp_tab_spec.map(
            function( arr, ix ){
                if ( ix === 0 && notime ) return;
                tab.add_column.call( tab, arr[ 0 ], null, arr[ 2 ] );
            }
        );
    }

    function step_inp_dtab_obj(){
        var tab = dtab.new_data_table();
        step_inp_dtab_column( tab );
        tab.html_target_id( 'sim_inparam_step' );
        return tab;
    }

    function step_inp_tab_fill(){
        if ( ! this.step_inp_tab ){
            this.step_inp_tab = step_inp_dtab_obj();
        }
        var tab = this.step_inp_tab;
        var log = this.run_log;
        var run = log [ log.length -1 ];
        var row = run[ 2 ].slice(0); // make a copy
        row.unshift( 1 ); // add time
        tab.data_in_row( [ row ] );
    }

    run_sim.prototype.step_inp_tab_to_html = 
        function( node, append ){
            step_inp_tab_fill.call( this );
            var tab = this.step_inp_tab;
            tab.to_html_node( node, append );
        };

    run_sim.prototype.step_inp_tab_to_csv = 
        function(){
            step_inp_tab_fill.call( this );
            var tab = this.step_inp_tab;
            return tab.to_csv();
        };

    // step log ------------------------------------------------------------

    function step_log_dtab_column( tab ){
        step_log_tab_spec.map(
            function( arr ){
                tab.add_column.apply( tab, arr );
            }
        );
    }

    function step_log_dtab_obj(){
        var tab = dtab.new_data_table();
        step_log_dtab_column( tab );
        tab.html_target_id( 'phs_out' );
        return tab;
    }

    function step_log_tab_fill(){
        if ( ! this.step_log_tab ){
            this.step_log_tab = step_log_dtab_obj();
        }
        var tab = this.step_log_tab;
        tab.data_in_row( this.step_log );
    }

    run_sim.prototype.step_log_tab_to_html =
        function( node, append ){
            step_log_tab_fill.call( this );
            var tab = this.step_log_tab;
            tab.to_html_node( node, append );
        };

    run_sim.prototype.step_log_tab_to_csv =
        function(){
            step_log_tab_fill.call( this );
            var tab = this.step_log_tab;
            return tab.to_csv();
        };

    // simulation result ------------------------------------------------------------

    function sim_resx_tab_add_column( tab ){
        sim_res_tab_spec.map(
            function( arr ){
                tab.add_column.call( tab, arr[ 0 ], null, arr[ 2 ] );
            }
        );
    }

    function sim_res_dtab_obj(){
        var tab = dtab.new_data_table();
        sim_resx_tab_add_column( tab );
        tab.html_target_id( 'sim_result_at_time' );
        return tab;
    }

    function sim_res_tab_fill(){
        if ( ! this.sim_res_tab ){
            this.sim_res_tab = sim_res_dtab_obj();
        }
        var tab = this.sim_res_tab;
        tab.data_in_row( this.sim_res );
    }

    run_sim.prototype.sim_res_to_html =
        function( node, append ){
            sim_res_tab_fill.call( this );
            var tab = this.sim_res_tab;
            tab.to_html_node( node, append );
        };

    run_sim.prototype.sim_res_to_csv =
        function(){
            sim_res_tab_fill.call( this );
            var tab = this.sim_res_tab;
            return tab.to_csv();
        };

    function sim_end_res_dtab_obj(){
        var tab = dtab.new_data_table();
        sim_resx_tab_add_column( tab );
        tab.html_target_id( 'sim_result_at_end' );
        return tab;
    }

    function sim_end_res_tab_fill(){
        if ( ! this.sim_end_res_tab ){
            this.sim_end_res_tab = sim_end_res_dtab_obj();
        }
        var tab = this.sim_end_res_tab;
        var log = this.run_log;
        var run = log [ log.length -1 ];
        tab.data_in_row( [ run[ 3 ] ] );
    }

    run_sim.prototype.sim_end_res_to_html =
        function( node, append ){
            sim_end_res_tab_fill.call( this );
            var tab = this.sim_end_res_tab;
            tab.to_html_node( node, append );
        };

    run_sim.prototype.sim_end_res_to_csv =
        function(){
            sim_end_res_tab_fill.call( this );
            var tab = this.sim_end_res_tab;
            return tab.to_csv();
        };

    // run log to csv ==========================================================

    function sim_target_tab_add_column( tab ){
        sim_target_tab_spec.map(
            function( arr ){
                tab.add_column.call( tab, arr[ 0 ], null, arr[ 2 ] );
            }
        );
    }

    function run_log_dtab_obj(){
        var tab = dtab.new_data_table();
        tab.add_column( 'name' );
        sim_inp_dtab_column( tab );
        step_inp_dtab_column( tab, true );
        sim_resx_tab_add_column( tab );
        sim_target_tab_add_column( tab );
        return tab;
    }

    function run_log_tab_fill(){
        if ( ! this.run_log_tab ){
            this.run_log_tab = run_log_dtab_obj();
        }
        var tab = this.run_log_tab;
        var log = this.run_log;
        var data = [];
        var row;
        var s_res;
        var target;
        for ( var ix = 0; ix < log.length; ++ix ){
            var run = log[ ix ];
            s_res = [];
            run[ 3 ].map(
                function( val, jx ){
                    if ( isNaN( val ) &&
                         ( jx === 2 || jx === 4 ||jx === 5 )){
                        s_res.push( 480 );
                    }
                    else{
                        s_res.push( val ); }
                }
            );
            row = [ run[ 0 ] ].concat(
                run[ 1 ],
                run[ 2 ], s_res,
                ( run[ 4 ] ? run[ 4 ] : sim_target_pid_default) );
            data.push( row );
        }
        tab.data_in_row( data );
    }

    run_sim.prototype.run_log_to_csv =
        function(){
            run_log_tab_fill.call( this );
            var tab = this.run_log_tab;
            return tab.to_csv();
        };

    run_sim.prototype.run_log_to_json =
        function(){
            return JSON.stringify( this.run_log );
        };

    // diagram utilities =========================================================

    function add_diagram(  html_dst, color_txt ){
        var e_dest = html_dst;
        var height = 300;
        var width = 600;
        var d = document;
        var frag = d.createDocumentFragment();
        var to;
        function ach_frag_tag( tag ){ return frag.appendChild(d.createElement( tag )); }
        function ach_to_tag( tag ){ return to.appendChild(d.createElement( tag )); }
        function ach_to_txt(  txt ){ return to.appendChild(d.createTextNode( txt )); }

        var title = ach_frag_tag( 'div' );
        title.setAttribute( "style", 'margin-left:30px;margin-top:0px;text-align:left' );
        color_txt.map(
            function( arr ){
                var color = arr [ 0 ];
                var txt = arr [ 1 ];
                to = title;
                to = ach_to_tag( 'span' );
                to.setAttribute( "style", 'margin-left:10px;color:' + color );
                ach_to_txt(  txt );
            }
        );
        to = ach_frag_tag( 'div' );
        var canvas = to = ach_to_tag(  'canvas' );
        to.setAttribute( "height", height );
        to.setAttribute( "width", width );

        e_dest.appendChild( frag );
        return diu.new_diagram( canvas, [ 0, 0, width - 5, height ] );
    }

    function to_int( val ){
        return ~~ val; // rounding towards zero
    }

    function log10(x) { return Math.log(x) / Math.LN10; }

    function magnitude( val1, val2 ){ //Math.floor(Math.log10(Math.abs(val)))
        var int1 = to_int( val1 );
        var int2 = to_int( val2 );
        return {
            int1 : int1,
            int2 : int2,
            inc : 0,
            scale : 0
        };
    }

    // simulation result as diagram =================================================

    var SIM_STEP_LIX = 480;
    var dia_xstep_nos = 8;
    var dia_xstep = 60;

    var diagram_x_expand = false;

    run_sim.prototype.diagram_x_expand =
        function( alt ){
            diagram_x_expand = alt ? true : false; 
        };
    
    var chart_nof_x = SIM_STEP_LIX; // not used

    run_sim.prototype.chart_nof_x =  // not used
        function( nof  ){
            chart_nof_x = nof;
        };
    
    // get data from the step_log

    function chart_data_arrxy( pid ){
        var self = this;
        var res = [];
        var log = this.step_log;
        var vix = step_log_pid.indexOf( pid );
        for ( var ix = 1; ix < log.length; ++ix ){
            res.push( [ ix, log[ ix ][ vix ] ]);
        }
        return  res;
    }

    function chart_data_xarr_yarr( pid ){
        var self = this;
        var xarr = [];
        var yarr = [];
        var log = this.step_log;
        var vix = step_log_pid.indexOf( pid );
        for ( var ix = 1; ix < log.length; ++ix ){
            xarr.push( ix );
            yarr.push( log[ ix ][ vix ] );
        }
        return {
            xarr : xarr,
            yarr : yarr
        };
    }

    function dia_x_domain(){
        var rv = {
            first : 0,
            step : [ { ms : dia_xstep, nos : dia_xstep_nos } ]
        };
        if ( diagram_x_expand === true ){
            rv.step = [
                { ms : 10, nos : 6, prop : 50 },
                { ms : 30, nos : 14, prop : 50 }
            ];
        }
        return rv;
    }

    // color

    var dia_color = [ 'rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(0,255,255)', 'rgb(255,0,255)' ];

    // temp diagram --------------------------------------------------

    var diagram_temp_pid = [ 'Tcreq', 'Tcr', 'Tre', 'Tsk'];

    function diagram_temp( html_dst ){
        var color_txt = [];
        for ( var ix = 0; ix < diagram_temp_pid.length; ix++ ){
            var txt = diagram_temp_pid[ ix ];
            if ( ix === 3 ){
                txt += ' (right scale)';
            }
            color_txt.push( [ dia_color[ ix ], txt ] );
        }
        var dia = add_diagram( html_dst, color_txt );
        dia.value_domain(
            {
                x_domain : dia_x_domain(),
                y_domain : { m0 : 35, step : [ { ms : 0.5, nos : 8 } ] },
                y_d2 : { m0 : 34, step : [ { ms : 0.5, nos : 8 } ] }
            }
        );
        dia.config( {
            axis_yl: {},
            axis_yr: { domain_id : 'y_d2' },
            axis_xb: {} 
        } );
        var dia1_pl0 = dia.plot_line( 'pl0' );
        var dia1_pl1 = dia.plot_line( 'pl1', { y_domain_id : 'y_d2', strokeColor :  dia_color[ 3 ]}  );
        dia.draw();
        dia1_pl0.draw_grid();
        var rv = chart_data_xarr_yarr.call( this, diagram_temp_pid[ 0 ] );
        var xarr = rv.xarr;
        dia1_pl0.draw_xarr_yarr( xarr, rv.yarr, dia_color[ 0 ] );
        rv = chart_data_xarr_yarr.call( this, diagram_temp_pid[ 1 ] );
        dia1_pl0.draw_xarr_yarr( xarr, rv.yarr, dia_color[ 1 ] );
        rv = chart_data_xarr_yarr.call( this, diagram_temp_pid[ 2 ] );
        dia1_pl0.draw_xarr_yarr( xarr, rv.yarr, dia_color[ 2 ] );
        rv = chart_data_xarr_yarr.call( this, diagram_temp_pid[ 3 ] );
        dia1_pl1.draw_xarr_yarr(xarr, rv.yarr );
    }

    function diagram_temp_cl( html_dst ){
        var rv = chart_data_xarr_yarr.call( this, 'Tcl' );
        var xarr = rv.xarr;
        var yarr = rv.yarr;
        var ymax = yarr[ 1 ];
        var ymin = ymax;
        yarr.map(
            function( y ){
                if ( y > ymax ){ ymax = y; }
                if ( y < ymin ){ ymin = y; }
            }
        );
        if ( ymin <= 0 ){ ymin -= 1; }
        ymin = ymin | 0;
        if ( ymax >= 0 ){ ymax += 1; }
        ymax = ymax | 0;
        var pd0 = chart_data_arrxy.call( this, 'Tcl' );
        var dia = add_diagram( html_dst, [ [ dia_color[ 0 ], 'Tcl' ] ]  );
        dia.value_domain(
            {
                x_domain :  dia_x_domain(),
                y_domain : { m0 : ymin, step : [ { ms : 1, nos : ymax - ymin + 1 } ] }
            }
        );
        dia.config( {
            axis_yl: {},
            axis_xb: {} 
        } );
        var dia1_pl0 = dia.plot_line( 'pl0' );
        dia.draw();
        dia1_pl0.draw_grid();
        dia1_pl0.draw_xarr_yarr( xarr, yarr, dia_color[ 0 ] );
    }

    // sweat diagram ------------------------------------------

    var diagram_sw_pid = [ 'SW', 'Epre', 'SWreq', 'SWmax' ];

    function diagram_sw( html_dst ){
        var pd0 = chart_data_arrxy.call( this, diagram_sw_pid[ 0 ] );
        var pd1 = chart_data_arrxy.call( this, diagram_sw_pid[ 1 ] );
        var pd2 = chart_data_arrxy.call( this, diagram_sw_pid[ 2 ] );
        var pd3 = chart_data_arrxy.call( this, diagram_sw_pid[ 3 ] );
        var color_txt = [];
        for ( var ix = 0; ix < diagram_sw_pid.length; ix++ ){
            color_txt.push( [ dia_color[ ix ], diagram_sw_pid[ ix ] ] );
        }
        var dia = add_diagram( html_dst, color_txt );
        dia.value_domain(
            {
                x_domain :  dia_x_domain(),
                y_domain : { m0 : 0, step : [ { ms : 100, nos : 5 } ] }
            }
        );
        dia.config( {
            axis_yl: {},
            axis_xb: {} 
        } );
        var dia1_pl0 = dia.plot_line( 'pl0' );
        dia.draw();
        dia1_pl0.draw_grid();
        dia1_pl0.draw( pd0, dia_color[ 0 ] );
        dia1_pl0.draw( pd1, dia_color[ 1 ] );
        dia1_pl0.draw( pd2, dia_color[ 2 ] );
        dia1_pl0.draw( pd3, dia_color[ 3 ] );
    }

    run_sim.prototype.step_log_to_graph =
        function( html_dst ){
            while( html_dst.hasChildNodes() ){
                html_dst.removeChild(html_dst.firstChild);
            }
            diagram_temp.call( this, html_dst );
            diagram_sw.call( this, html_dst );
            diagram_temp_cl.call( this, html_dst );
            diagram_swtotg.call( this, html_dst );
    };
    
    // SWtotg diagram -------------------------------------------------------

    function diagram_swtotg(  html_dst ){
        var pd0 = chart_data_arrxy.call( this, 'SWtotg' );
        var dia = add_diagram( html_dst, [ [ dia_color[ 0 ], 'SWtotg' ] ] );
        dia.value_domain(
            {
                x_domain : { first : 0, step : [ { ms : dia_xstep, nos : dia_xstep_nos } ]  },
                y_domain : { m0 : 0, step : [ { ms : 1000, nos : 8 } ] }
            }
        );
        dia.config( {
            axis_yl: {},
            axis_xb: {} 
        } );
        var dia1_pl0 = dia.plot_line( 'pl0', { strokeColor : dia_color[ 0 ] } );
        dia.draw();
        dia1_pl0.draw_grid();
        dia1_pl0.draw( pd0 );
    }

    // data logging =============================================================

    // run_log ------------------------------------------------------------------

    // this.run_log = [ sim_log, ... ]
    // sim_log = [ tag, [sim_inp], [ step_inp], [ sim_res ], [ sim_target ]? ]
    //                 sim_inp_pid step_inp_pid

    run_sim.prototype.run_log_reset =
        function(){
            this.run_log = [];
        };
 
    function run_log_new_run( tag ){ // new simulation
        this.run_log.push( [ tag, [], [], [] ] );
    }

    // phs input parameter at simulation start ----------------------------------

    function run_log_phs_inp(){ // get parameters from phs
        var log = this.run_log;
        var run = log [ log.length -1 ];
        var dst = [ ];
        sim_inp_pid.map(
            function( pid ){
                dst.push( par_get( pid ) );
            }
        );
        run[ 1 ] = dst;
        dst = [ ];
        step_inp_pid.map(
            function( pid ){
                if ( pid !== 'time' ){
                    dst.push( par_get( pid ) );
                }
            }
        );
        run[ 2 ] = dst;
    }

    function run_log_expect( exp_obj ){
        var log = this.run_log;
        var run = log [ log.length -1 ];
        var dst = [ ];
        sim_target_pid.map(
            function( pid ){
                var val = exp_obj[ pid];
                val === undefined ? NaN : val;
                dst.push( val  );  
            }
        );
        run[ 4 ] = dst;
    }

    // sim_res_log phs simulation intermediate and end result -------------------------------

    // this.sim_res = [ [sim_res], ... ]

    function sim_res_log_reset(){
        this.sim_res = [];
    }

    function sim_res_push( obj){
        var res = [];
        sim_res_pid.map(
            function( pid ){ res.push( obj[ pid ]); }
        );
        this.sim_res.push(res);
    }

    function sim_res_log_after_end(){
        var log = this.sim_res;
        var last = log[ log.length - 1 ];
        var rlog = this.run_log;
        var rlast = rlog[ rlog.length - 1 ];
        rlast[ 3 ] = last.slice( 0 );
    }

    // step_log, phs time step log -------------------------------------------------------

    // this.step_log = [ step_data, ... ]

    function step_log_reset(){
        this.step_log = [];
    }

    function step_log_data( data ){
        var res = [];
        step_log_pid.map(
            function( pid ){
                res.push( data[ pid ] );
            }
        );
        var log = this.step_log;
        log.push( res );
    }
 
    // run a simulation ========================================================

    // config time wenn getting result 
    run_sim.prototype.result_time =
        function( arr ){
            this.time_res = arr.slice();
        };

    run_sim.prototype.result_expect =
        function( exp_obj ){
            this.expect = exp_obj;
        };

    run_sim.prototype.run_simulation =
        function( tag, config ){
            this.sim_time = 0;
            this.no_step_log = false;
            if( config ){
                this.no_step_log = ! ! config[ 'no_log' ];
            }
            if ( ! this.run_log ){
                this.run_log_reset();
            }
            run_log_new_run.call( this, tag );
            run_log_phs_inp.call( this );
            if ( this.expect ){
                run_log_expect.call( this, this.expect );
            }
            sim_res_log_reset.call( this );
            step_log_reset.call( this );
            phs.sim_init();
            var state = phs.state();
            sim_res_push.call( this, state );
            step_log_data.call( this, state );
            //-----------------------
            run_sim_step.call( this );
            //-----------------------
            sim_res_log_after_end.call( this );
        };

    function run_sim_step(){
        var time_res = this.time_res;
        var self = this;
        time_res.map(
            function( stop_at ){
                run_sim_step_stop_at.call( self, stop_at );
                sim_res_push.call( self, phs.current_result() );
            }
        );
    }

    // set callback function( sim_time ) called before each step 
    run_sim.prototype.sim_step_call_back =
        function( cb  ){
            this.step_cb = cb;
        };


    function run_sim_step_stop_at( stop_at ){
        do {
            if ( this.step_cb ){
                this.step_cb( this.sim_time );
            }
            var res = phs.time_step();
            var time = res.time;
            this.sim_time = time;
            if( ! this.no_step_log ) {
                step_log_data.call( this, res );
            }
        }
        while ( time < stop_at )
    }

   // run std_example ==========================================================

    var std_example_target_pid = [ 'Tre', 'D_Tre', 'SWtotg', 'Dwl50', 'Dwl95' ];

    var std_example_target_aoa  = [
            [ 480, 37.5, 480, 6168, 439, 298 ],
            [ 480, 39.8, 74, 6935, 385, 256 ],
            [ 480, 37.7, 480, 7166, 380, 258 ],
            [ 480, 41.2, 57, 5807, 466, 314 ],
            [ 480, 37.6, 480, 3892, 480, 463 ],
            [ 480, 37.3, 480, 6763, 401, 271 ],
            [ 480, 39.2, 70, 7236, 372, 247 ],
            [ 480, 41, 67, 5548, 480, 318 ],
            [ 480, 37.5, 480, 6684, 407, 276 ],
            [ 480, 37.6, 480, 5379, 480, 339 ]
    ];

    function std_example_in_data( eix ){ // eix = 0 is first example
        var data_in_default = {
            data_seq_name:"ISO7933", accl:100, drink:1, height:1.8, mass:75, sim_mod:1,
            post:2, Tair:35, Pw_air:3.0, Trad:40, v_air:0.3, Met:150, Icl:0.5, im_st:0.38,
            fAref:0.54, Fr:0.97, walk_dir:null, v_walk:null, work:0};
        var data_in = [
            {post:2, Tair:40, Pw_air:2.5},
            {post:2, Pw_air:4, Trad:35},
            {post:2, Tair:30, Trad:50},
            {accl:0, post:2, Tair:28, Trad:58},
            {accl:0, post:1, Trad:35, v_air:1},
            {post:1, Tair:43, Trad:43, Met:103},
            {accl:0, post:2, Trad:35, Met:206},
            {accl:0, post:2, Tair:34, Trad:34, Icl:1},
            {post:2, Tair:40, Icl:0.4},
            {post:2, Tair:40, Icl:0.4, im_st:0.38, fAref:0.54, Fr:0.97, walk_dir:90, v_walk:1}
        ];
        if ( eix < 0  ||  eix >= data_in.length ){
            alert( 'std_example_in_data' + eix );
            return {};
        }
        var res = {};
        [ data_in_default, data_in[ eix ] ].map(
            function( obj ){
                for ( var pid in obj ){
                    res[ pid ] = obj[ pid ];
                } 
            }
        );
        return res;
    }

    var std_example_leix = std_example_target_aoa.length - 1;
    var std_example_sim_mod = [
        [ 1, 's1'] , [ 2, 's2'], [ 3, 's1m'], [ 4, 's2m'] ];

    run_sim.prototype.run_log_std_example_target =
    function (){
        var target = std_example_target_aoa;
        var run_log = this.run_log;
        var lix = 0;
        target.map(
            function( arr ){
                run_log[ lix ][ 4 ] = arr;
                lix++;
                run_log[ lix ][ 4 ] = arr;
                lix++;
                run_log[ lix ][ 4 ] = arr;
                lix++;
                run_log[ lix ][ 4 ] = arr;
                lix++;
            }
        );
    };
    
    function std_example_to_b_data_store(){
        var b_data_store =  [];
        for ( var eix = 0; eix <= std_example_leix; eix++ ) {
            var parval = std_example_in_data( eix );
            var tag0 =  'ISO7933_' + ( eix + 1 ) + '_';
            std_example_sim_mod.map(
                function( smod_tag ){
                    var smod = smod_tag[ 0 ];
                    var tag = tag0 + smod_tag[ 1 ];
                    var dst = {};
                    for ( var pid in parval ){
                        dst[ pid ] = parval[ pid ];
                    }
                    dst[ 'sim_mod' ] = smod;
                    dst[ 'data_seq_name' ] = tag0 + smod_tag[ 1 ];
                    b_data_store.push( dst );
                }
            );
        }
        return b_data_store;
    }

    // external interface =======================================================
    
    var self = {
        new_run_sim : new_run_sim,
        sim_inp_pid : sim_inp_pid,
        step_inp_pid : step_inp_pid,
        sim_inp_tab_create_only : sim_inp_dtab_obj,
        step_inp_tab_create_only : step_inp_dtab_obj,
        sim_res_pid : sim_res_pid,
        step_log_pid : step_log_pid,
        std_example_in_data : std_example_in_data,
        std_example_sim_mod : std_example_sim_mod,
        std_example_to_b_data_store : std_example_to_b_data_store
    };

    return self;
})(document);   
