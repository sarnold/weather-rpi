#!/usr/bin/env python

# display information on rpi
# using the pygame module
# assuming PiTFT hardware

import pygame
import pygame.display as dsp
import pygame.time as tm
import os, sys

# globals section

wpix=320   # PiTFT display width in pixels
dpix=240   # PiTFT display depth in pixels

str_tp=__builtins__.str
int_tp=__builtins__.int
flt_tp=__builtins__.float
dtypes=(str_tp,int_tp,flt_tp)

# field on the display
class field(pygame.Surface):
    def __init__(self,ww,dd,cl=(0,0,0)):
        super(field,self).__init__((ww,dd))
        self.fld_color=cl # data display color, default black
        self.disp_tp=__builtins__.str  # default is string
        self.value=None
        self.fmt=None  #  format info object for the field
    def get_data(self, ddic):
        pass
    def set_fmt(self,f):
        self.fmt=f
    def set_tp(self,ttpp):
        self.disp_tp=ttpp
    
class scr:
    def __init__(self,cfgdir="conf",cfg="scr.cfg",dat="dat",pix='pix',
                 bckgnd=(250,250,250)
                ):
        self.config_dir=cfgdir
        self.config_file=cfg
        self.data_dir=dat
        self.pix_dir=pix
        self.back_color=bckgnd
        # field dictionary - name:(fldobj,xpos,ypos)
        self.fields={}
    def add_field(self,f):
        self.fields.append(f)
    def config_fields(self,scrn_nm):
        # gets screen data by name from directory and file
        pass
        
    def config(self):
        # top level config
        pass
        
    def config_data(self):
        pass
        
    def display_field(self,name):
        pass
        
    def update_field():
        pass
        
    def update_fields():
        pass
        
    
    
def main(con="conf",dat="data",pic="pix",cf="lay.txt"):
    # configuration
    # initialize pygame
    pygame.init()
    screen=dsp.set_mode((wpix,dpix))  # the display object
    dsp.set_caption('Weather Demo')
    
    # initialize screen data
    # fields are not displayed yet
    wxf=scr(con,dat,pic)
    wxf.config()
    
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
        # end of main loop
        
    
    pygame.quit()
print "pyg",wpix




#this calls the 'main' function when this script is executed
if __name__ == '__main__':
    main()
