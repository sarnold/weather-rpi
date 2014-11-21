#!/usr/bin/env python

# display information on rpi
# using the pygame module
# assuming PiTFT hardware

import pygame
import pygame.display as dsp
import pygame.time as tm
import json
import os, sys
import types
from types import IntType,FloatType,StringType

# globals section
srf=pygame.Surface
rct=pygame.Rect

# test globals
sec=1000
wait_time=10*sec    # milliseconds

class scr:
    def __init__(self,szw=320, szd=240,  # PiTFT size (pixels)
                 bckgnd=(250,250,250)    # gray
                ):
        self.win=srf((szw,szd))  # the displayable window
        self.back_color=bckgnd
        self.win.fill(self.back_color)
        # field dictionary - {fldtag:(fldobj,xpos,ypos)}
        self.fields={}
        # which data to which fields and how
        self.assg_dic={}
        
    def config(self,cf):  # configuration object required
        pass
        
    # add a field to the field dictionary
    def add_field(self,ftag,fld,fldx,fldy):
        self.fields[ftag]=(fld,fldx,fldy)

    # remove a field from the field dictionary   
    def del_field(self,ftag):
        # delete field entry
        # no error if field is unknown
        try: 
            del self.fields[ftag]
        except KeyError:
            pass
             
    def set_assignments(self,asgs):
        self.assg_dic=asgs
                   
    def display_field(self,name):
        pass
        
    def display_fields(self):
        for f in self.fields:
            self.display(f)
            
    def update_field(self,name):
        pass
        
    def update_fields(self):
        for f in self.fields:
            self.update_field(f)
        
class cfg:  # object containing configuration data
            # read from json file (not file name)
    def __init__(self,js_file):
        self.jsdata=json.load(js_file)  

class fld:  # describes a field for a screen
    def __init__(self,tg,clr=(0,0,0),ww=70,dd=10):
        self.tag=tg
        self.fld_width=ww
        self.fld_depth=dd
        self.font=None     # pygame uses a default font if None
        self.fld_color=clr # default color is black
        self.win=srf((ww,dd))  # displayable window for field
        
    def set_color(self,c):
        # background color for field
        self.fld_color=c
        
    def set_font(self,f):
        # supply a font object for this field
        self.font=f
        
    def config(self,cf):  # configuration object required
        pass
        
class value_desc:  # describes data values
                   # {data-tag:[source, type, label, description] }
    def __init__():
        self.data_descs={}
    def add_desc(self,tg,src,tp,lbl=None,dsc=None):
        self.data_descs[tg]=[src,tp,lbl,dsc]
    def get_source(self,tg):
        return self.data_descs[tg][0] 
    def get_type(self,tg):
        # type is string, number or picture
        return self.data_descs[tg][1] 
    def get_label(self,tg):
        return self.data_descs[tg][2] 
    def get_description(self,tg):
        return self.data_descs[tg][3]
    def config(self,cf):  # configuration object
        pass
            
# attributes for display of a data item
# depends on data type
class display_attribs:
    def __init__(self,tp="S",leng=None,dpos=("C","C"),dmft=None):
        """
           tp: data type - S is string
                           F is float
                           P is picture
           leng: length to be displayed, default is whole thing for string
                 or picture, ten digits for float
           dpos: (horizontal positioning,vertical positioning)
                 default is center, center
           dfmt: for a string, ignored even if present
                 for a float, Python formatting
                 for a picture, alpha controls etc. 
        """
        self.dat_type=tp
        self.dat_length=leng
        self.dat_pos=dpos
        self.dat_format=dmft
    
    def set_length(self,ln):
        if type(ln) != types.IntType:
            print sys.stderr, "length not specified as integer", ln
            raise ValueError
        self.dsp_length=ln
        
    def get_length(self):
        return self.dsp_length
        
    def set_pos(self,typ,pos):
        """
            horizontal positioning is L - left
                                      R - right
                                      C - center
        """
        if (typ not in ("S","F","P")      or
              pos[0] not in ("L","R","C") or
              pos[1] not in ("L","R","C") ):
            print sys.stderr,"bad field positioning",typ,pos
            raise ValueError
        # a picture is always centered in the field
        if typ=="P":
           self.dat_pos=("C","C")
           return
        else:
            self.dat_pos=pos
    
    def get_format(self):
        return self.dat_format
              
    def set_format(self,new_fmt):
        self.dat_format=new_fmt()
 
# who, where and how
# assign a data value to a field
# assign a format to a field
class assignments:
    """
       the assignment dictionary looks like:
       {field tag: (
                    data tag,
                    data type,
                    data object to be displayed,
                    display attributes object or None
                   )
       }
    """
    def __init__(self,asgs={}):
        assigs=asgs
    
    # new entry in dictionary            
    def asg_data(self,field_tag,data_tag,data_value,
                 data_type="S",dsp_attr=None):
        self.assigs[field_tag]=(data_tag,data_value,
                                data_type,dsp_attr)
                                
    # replace attribute object with a provided one
    def asg_attr(self,ftag,attr):
        try:
            dt,dv,dp,attr=self.assigs[ftag]
            self.assigs[ftag]=(dt,dv,dp,attr)
        except KeyError:
            print >> stderr,"field tag not found for attr update",ftag,attr
        
            
    # replace attribute object with a created one
    def replace_attribs(self,ftag,tp="S",leng=None,dpos=("C","C"),
                        dmft=None):
        try:
            dt,dv,dp,attr=self.asgs[ftag]
            new_attr=display_attribs(tp,leng,dpos,dmft)
            self.assigs[ftag]=(dt,dv,dp,new_attr)
        except KeyError:
            print >> stderr,"field tag not found for attr update",ftag,attr
        
    # replace format (belongs to the attribute object)
    def asg_format(self,ftag,fmt):
        try:
            asg_rec=self.assigs[ftag]
            attr=asg_rec[3]
            attr.set_format(fmt)
        except KeyError:
            print >> stderr,"cannot update fmt",ftag,fmt
        
    def config(self,cf):  # configuration object required
        pass

def bogus_config(ccc='ccc',fff=[]):
    print ccc,fff
    fff.append('ugluk')
    #print fff
    xlocs=[10,110]
    ylocs=range(10,300,30)
    fd=30
    fw=100
    locs=[(x,y)  for y in ylocs for x in xlocs]
    # {data-tag:[source, type, label, description] }
    val_desc={
            'v1':['One',"S",'field 1','this is the first datavalue'],
            'v2':['Two',"S",'field 2',''],
            'v3':['No. 3'     ,"S",'field 3','third datavalue'],
            'v4':['testing',"S",'field 1','testing datavalue'],
            'v5':['here',"S",'field 1','not the first datavalue'],
            'v6':['Three',"S",'field 6','this is #6 datavalue'],
            'v7':['Seven',"S",'nice 1' ,'this is the 7th datavalue'],
            'v8':['overthere',"S",'field 8','looking at a datavalue'],
            'v9':['Nine',"S",'field 9','this is the #nine datavalue'],
            'vz':['zzzz',"S",'field z','this is the last datavalue']  
         }
    fff.append(val_desc)
    ftags=["f1","f2","f3","f4","f5","f6","f7","f8","f9","f0"]
    # field -  __init__(self,tg,clr=(0,0,0),ww=70,dd=10):
    # dic   -  {fldtag:(fldobj,xpos,ypos)}
    fdic={}
    for ff in range(len(ftags)):
        fdic[ftags[ff]]=(fld(ftags[ff],ww=fw,dd=fd),locs[ff][0],locs[ff][1])
    fff.append(fdic)
    vals={
          'v1':"So she went",'v2':"into the garden",'v3':"to pick",
          'v4':"a cabbage leaf",'v5':"Who has seen the wind?",
          'v6':"foofaraw",'v7':"whiffletree",'v8':"snork",
          'v9':"fiddle-dee-dee",'vz':"(the end)"
         }
    dtags=['v1','v2','v3','v4','v5','v6','v7','v8','v9','vz']  
    aassggss={}
    # assigs[field_tag]=(data_tag,data_value,data_type,dsp_attr)
    #                                           ='S'     =None
    for ff in range(len(ftags)):
        tg=ftags[ff]
        dtg=dtags[ff]
        dv=vals[dtg]
        desc_rec=val_desc[dtg]
        dtp=desc_rec[1]
        attr=display_attribs()  # it needs its own
                                # what if we add (or change) format
        aassggss[tg]=(dtg,dv,dtp,attr)   
    fff.append(aassggss)
    
def testing(tdata=[]):
    print "testing, 1,2,3..."
    import pdb; pdb.set_trace()
    bogus_config(fff=tdata)
    #print tdata, "from testing app"
    v=tdata[1]
    f=tdata[2]
    a=tdata[3]
    print "v",v,"f",f,"a",a
    s=scr()
    #c=cfg()
    att=display_attribs()
    agm=assignments()
    
    
    print "end of test"

def main(con="conf",dat="data",pic="pix",cf="lay.json"):
    print "pyg start"
    
    # configuration
    #bogus_config(con,cf)
        
    # initialize pygame
    pygame.init()
    screen=dsp.set_mode((320,240))  # the display object
    dsp.set_caption('Weather Demo')
    
    # run test code
    testing()
    
    """    
    # initialize screen
    # fields are defined
    # fields are not displayed yet
    wxf=scr(con,dat,pic)
    wxf.config(cf)
    
    # the main loop is a do-forever
    onward=True
    while(onward):
        # button check
        # data acquisition
        # data format
        # update screen data
        # display new screen data
    
        tm.wait(8000)
        onward=False    
        # exit test?
        # entd of main loop
        
    """
    print "I'm waiting..."
    tm.wait(wait_time)
    pygame.quit()
   


# this calls the 'main' function when this script is executed
if __name__ == '__main__':
    print "Hello, pyg"
    main()
print "Goodbye, pyg"