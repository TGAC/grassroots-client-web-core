(function($){
    $.fn.jExpand = function(){
        var element = this;

        $(element).find("tr:odd").addClass("odd");
        $(element).find("tr:not(.odd)").hide();
        $(element).find("tr:first-child").show();

        $(element).find("tr.odd").click(function() {
            $(this).next("tr").toggle();
        });

    }

    $.fn.show_all = function(){
        var element = this;
        $(element).find("tr.odd").next().show();
    }

    $.fn.hide_all = function(){
        var element = this;
        $(element).find("tr.odd").next().hide();
    }
})(jQuery);

(function($){
    $.fn.load_msa = function(id){
        var element = this;
        $.each($(element).find("tr.odd"),  function( key, value ) {

            var msa_div = "msa-" + value.id;
            var url = 'primers.fa';
            // var url = "get_mask?id="+id+"&marker="+value.id;

            biojs.io.fasta.parse.read(url, function(seqs){
                if(seqs){
                    div_obj = document.getElementById(msa_div);

                    var primers = div_obj.getAttribute("data-primers").toUpperCase();
                    var  primers_arr = primers.split(",");
                    var chr_index = null;

                    var i = 0;
                    seqs.map( function(item) {
                        var split = item.name.split("-");
                        if(split.length== 2){
                            item.name = split[1];
                        }
                        if(item.name == primers_arr[0]){
                            chr_index = i;
                        }
                        i++;
                    });


                    var a=seqs[0];
                    var b=seqs[1];
                    var c=b;
                    var left_most = 0;

                    if(seqs[chr_index]){
                       c=seqs[chr_index];
                    }

                    var mask = seqs[seqs.length-1];
                    var index_snp = mask.seq.indexOf("&") ;
                    if(index_snp < 0){
                        index_snp = mask.seq.indexOf(":");
                    }

                    var msa = new biojs.vis.msa.msa({
                        el: div_obj,
                        seqs: seqs,
                        zoomer: {
                            labelWidth: 100,
                            //alignmentWidth: "auto" ,
                            alignmentWidth: 1000 ,
                            labelFontsize: "13px",
                            labelIdLength: 50
                        },
                        g:{
                            conserv: false,
                            registerMouseClicks: false,
                            scheme: "nucleotide",
                            allowRectSelect : false
                        }

                    }) ;
                    msa.g.vis.set("conserv",  false);
                    msa.g.vis.set("registerMouseClicks", false);
                    msa.g.colorscheme.set("scheme", "nucleotide");
                    msa.g.config.set("registerMouseClicks", false);


                    var a_b_start = index_snp;
                    left_most = index_snp - primers_arr[1].length;
                    var end_obj = find_end_with_gaps({
                        start:index_snp,
                        length:primers_arr[1].length,
                        seq:c,
                        skip:true});

                    var a_c_end = end_obj.end -1;

                    var start_obj = find_start_with_gaps({
                        end:end_obj.end,
                        length:primers_arr[5],
                        seq:c});

                    var common_index = start_obj.start;

                    var end_obj_2 = find_end_with_gaps({
                        start:common_index,
                        length:primers_arr[3].length,
                        seq:c,
                        validate:primers_arr[3]});

                    var common_start = common_index;
                    var common_end = end_obj_2.end - 1;

                    if(primers_arr[4] == "FORWARD"){

                        start_obj = find_start_with_gaps({
                                                end:index_snp,
                                                length:primers_arr[1].length,
                                                seq:c,
                                                skip:true});
                        a_b_start =  start_obj.start + 1;
                        a_c_end = index_snp ;


                        var complement = reverse_complement(primers_arr[3]);
                        end_obj = find_end_with_gaps({
                            start:a_b_start,
                            length:primers_arr[5],
                            seq:c
                        });
                        common_index = end_obj.end;
                        var start_obj_2 = find_start_with_gaps( {
                                end:end_obj.end,
                                length:primers_arr[3].length,
                                seq:c,
                                validate: complement
                        }
                        );
                        common_start = start_obj_2.start;
                        common_end = end_obj.end - 1;
                    }
                    if(common_index >= 0 && c != b){
                        var se = new biojs.vis.msa.selection.possel(
                            {xStart: a_b_start,
                                xEnd: a_c_end
                                ,seqId: 0});

                        var se2 = new biojs.vis.msa.selection.possel(
                            {xStart: a_b_start,
                                xEnd: a_c_end
                                ,seqId: 1});

                        var se3 = new biojs.vis.msa.selection.possel(
                            {xStart: common_start,
                                xEnd: common_end
                                ,seqId: chr_index});
                        msa.g.selcol.add(se);
                        msa.g.selcol.add(se2);
                        msa.g.selcol.add(se3);
                    }
                    msa.g.zoomer.setLeftOffset(left_most);
                    msa.render();
                }
            });
        });
    }
})(jQuery);

function find_end_with_gaps(opts){
    var args = {start:0, length:0, seq:null, validate:null, skip:false} ;
    if (opts.start) args.start = opts.start;
    if (opts.length)args.length = opts.length;
    if (opts.seq)args.seq = opts.seq;
    if (opts.validate)args.validate = opts.validate;
    if (opts.skip)args.skip = opts.skip;
    var sequence = args.seq.seq.toUpperCase();
    var to_count = args.length;
    var i;

    for(i = args.start; i < sequence.length && to_count > 0; i++){
       // if(!args.skip)
        if(sequence[i] != '-'){
           to_count--;
       }
    }

    var ret ={};
    ret.sequence = sequence.substring(args.start, i)  ;
    ret.end = i;
    ret.valid = true;
    //if(args.validate){
    //    ret.valid = ret.sequence == args.validate.replace(/-/g, '');
    //}

    return ret;

}

function find_start_with_gaps(opts){
    var args = {end:50, length:0, seq:null, validate:null, skip:false}     ;
    if (opts.end) args.end = opts.end;
    if (opts.length) args.length = opts.length;
    if (opts.seq) args.seq = opts.seq;
    if (opts.validate)args.validate = opts.validate;
    if (opts.skip) args.skip = opts.skip;

    var sequence = args.seq.seq.toUpperCase();
    var to_count = args.length;
    var i;
    for(i = args.end; i > 0 && to_count > 0; i--){
       //if(!args.skip)
       if(sequence[i] != '-'  ){
           to_count--;
       }
    }

    var ret ={};
    ret.sequence = sequence.substring(i, args.end)  ;
    ret.start = i;
    ret.valid = true;
   // if(args.validate){
   //     ret.valid = ret.sequence == args.validate.replace(/-/g, '');
   // }

    return ret;

}


function reverse_complement(s) {
    var r; // Final reverse - complemented string
    var x; // nucleotide to convert
    var n; // converted nucleotide
    var i;
    var k;

    var r = ""; // Final processed string
    var i;
    var k;

    if (s.length==0)
        return ""; // Nothing to do
    // Go in reverse
    for (k=s.length-1; k>=0; k--) {
        x = s.substr(k,1);

        if (x=="a") n="t"; else
        if (x=="A") n="T"; else
        if (x=="g") n="c"; else
        if (x=="G") n="C"; else
        if (x=="c") n="g"; else
        if (x=="C") n="G"; else
        if (x=="t") n="a"; else
        if (x=="T") n="A"; else
        // RNA?
        if (x=="u") n="a"; else
        if (x=="U") n="A"; else

        // IUPAC? (see http://www.bioinformatics.org/sms/iupac.html)
        if (x=="r") n="y"; else
        if (x=="R") n="Y"; else
        if (x=="y") n="r"; else
        if (x=="Y") n="R"; else
        if (x=="k") n="m"; else
        if (x=="K") n="M"; else
        if (x=="m") n="k"; else
        if (x=="M") n="K"; else
        if (x=="b") n="v"; else
        if (x=="B") n="V"; else
        if (x=="d") n="h"; else
        if (x=="D") n="H"; else
        if (x=="h") n="d"; else
        if (x=="H") n="D"; else
        if (x=="v") n="b"; else
        if (x=="V") n="B"; else

        // Leave characters we do not understand as they are.
        // Also S and W are left unchanged.

            n = x;
        if(n.length == 1)
        r = r + n;
    }
    return r;
}




var csv_file_with_newline = "Marker,SNP,RegionSize,chromosome,total_contigs,contig_regions,SNP_type,A,B,common,primer_type,orientation,A_TM,B_TM,common_TM,selected_from,product_size,errors\n" +
"BS00167765,T51C,301,3D,3,IWGSC_CSS_3B_scaff_10769471:856-955|IWGSC_CSS_3AS_scaff_412520:1755-1854|IWGSC_CSS_3DS_scaff_2591135:3292-3391,homoeologous,ccatggcatataatcagactgcA,ccatggcatataatcagactgcG,ttttacgccatgaagagtaaTcaG,chromosome_specific,reverse,58.671,59.627,57.338,first,141,\n" +
"BS00068396_51,T51C,301,2A,3,IWGSC_CSS_2AS_scaff_5222932:2915-3015|IWGSC_CSS_2DS_scaff_5334799:6813-6913|IWGSC_CSS_2BS_scaff_5245544:4550-4618,homoeologous,aCgactaatcaagatcctgcatA,aCgactaatcaagatcctgcatG,tcaccagcactcacatgagC,chromosome_specific,reverse,57.209,58.625,60.321,first,105,\n" +
"Excalibur_c25234_143,A51G,301,2B,3,IWGSC_CSS_2BS_scaff_5216472:4831-4931|IWGSC_CSS_2AS_scaff_991388:1799-1899|IWGSC_CSS_2DS_scaff_5322360:1-54,homoeologous,gagtttgacttgatcccgagA,gagtttgacttgatcccgagG,cctcgtcgaccaagcagatT,chromosome_specific,forward,57.405,58.378,60.109,first,58,\n" +
"BS00183592,A101C,301,3B,3,IWGSC_CSS_3AS_scaff_3293289:5813-5887|IWGSC_CSS_3DS_scaff_2586804:936-1010|IWGSC_CSS_3B_scaff_10398983:3275-3349,non-homoeologous,cctcaacagcaggacacttT,cctcaacagcaggacacttG,cctctagccttgaaactgtttgt,chromosome_semispecific,reverse,58.027,58.767,58.862,second,103,\n" +
"BobWhite_c10578_272,A51G,301,2B,3,IWGSC_CSS_2BS_scaff_5159361:2544-2644|IWGSC_CSS_2DS_scaff_5388867:1679-1779|IWGSC_CSS_2AS_scaff_5297005:1573-1673,homoeologous,atgtcCgcatatgattcCagT,atgtcCgcatatgattcCagC,aAaATATGAtttccaggttctCtcC,chromosome_specific,reverse,57.223,58.570,57.112,first,111,\n" +
"D_comp3873_c0_seq1:967,G501C,205,2D,1,IWGSC_CSS_2BS_scaff_5245578:896-1189,non-homoeologous,caaaggacattcttttatcctcgG,caaaggacattcttttatcctcgC,cagatgccaggtggtgatga,chromosome_nonspecific,forward,58.427,57.876,59.746,first,67,\n" +
"BobWhite_c11739_325,A51G,301,2B,3,IWGSC_CSS_2BS_scaff_5159361:1921-2021|IWGSC_CSS_2DS_scaff_5388867:2303-2403|IWGSC_CSS_2AS_scaff_5297005:2197-2297,homoeologous,gctagatggttttgaCtcAcgT,gctagatggttttgaCtcAcgC,ggatcaagactttcaatgcgattC,chromosome_specific,reverse,58.673,59.906,58.731,first,72,\n" +
"BobWhite_c10287_421,T51C,301,1B,2,IWGSC_CSS_1BL_scaff_3917809:528-606|IWGSC_CSS_1DL_scaff_2275213:7001-7079,homoeologous,cctgagttgctcttcaccaaT,cctgagttgctcttcaccaaC,cgtgtaaataacggacaaggc,chromosome_semispecific,forward,58.212,59.124,57.621,second,74,\n" +
"BobWhite_c23388_471,A51G,301,6A,7,IWGSC_CSS_6AS_scaff_4364920:674-774|IWGSC_CSS_7DS_scaff_3895757:1472-1572|IWGSC_CSS_2AL_scaff_6398333:1946-2046|IWGSC_CSS_6BS_scaff_2705951:1854-1954|IWGSC_CSS_3AL_scaff_4354860:7421-7521|IWGSC_CSS_3B_scaff_10758157:3413-3498|IWGSC_CSS_5AL_scaff_2737898:5003-5067,homoeologous,gaaAgtggttGaGgAcgGT,gaaAgtggttGaGgAcgGC,tgggcagcgggtaggcTA,chromosome_semispecific,reverse,57.300,58.755,62.789,second,50,\n";