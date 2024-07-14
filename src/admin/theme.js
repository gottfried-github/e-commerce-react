import { createTheme } from '@mui/material/styles/index.js'

const themeDefault = createTheme({})

const theme = createTheme(themeDefault, {
  components: {
    MuiButton: {
      variants: [
        {
          props: {
            variant: 'header',
          },
          style: {
            color: themeDefault.palette.primary.contrastText,
          },
        },
      ],
    },
  },
})

export default theme
