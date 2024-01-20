

import {useEffect, useRef} from 'react'
import {Animated, Dimensions, StyleSheet} from 'react-native'
import {useSelector} from 'react-redux'
import {selectKeyboard, selectOrientation} from '../slices/appSlice'
import {IsIpad, IsTablet} from '../constants'

/* 
    visibility: Maneja la visibilidad donde true hace que se muestre el modal y false lo oculta.

    dismissable: Maneja la función de handleDismiss, permite poder cerrar el modal desde la parte externa del modal
    true: podemos cerrar el modal desde afuera y false no permite cerrarlo, esto en caso de querer cerrar el modal
    especificamente con un icono de "X".

    handleDismiss: Esta es la función que queremos ejecutar una vez que el modal se va a cerrar desde la parte externa.

    duration: Por defecto esta en 500, es el tiempo que tarda la animación en ejecutarse, pueden ponerle la que usteden deseen.

    defaultWidth: En caso de querer algún width especifico que se adapte mejor a su contenido, aquí pueden pasarlo ya sea en
    pixeles o en % como cadena defaultWidth = 500 || defaultWidth = '65%'

    size: Cuando nuestro modal no ocupe más de la mitad de nuestra pantalla como es el caso del ejemplo del repositorio, 
    en ese caso, no mandar nada ya que la propiedad por defecto es 's' ---> small, en caso de que el modal que deseen agregar sea 
    mayor a la mitad de la pantalla en ese caso manden 'l' --> 'large' para que el contenido tome un alto más adecuado para cada caso.

    No olviden que la propiedad de children es todo lo que va a contener nuestro modal, en caso de tener un contenido que requiera scroll
    no olviden mandarlo el ScrollView como children.
*/

export default ({visibility = true, dismissable = true, handleDismiss = () => {}, duration = 500, defaultWidth = null, size = 's', children}) => {
    
    const keyboard = useSelector(selectKeyboard)
    const orientation = useSelector(selectOrientation)

    const height = Dimensions.get('window').height
    
    const maxWidth = defaultWidth ? defaultWidth : IsTablet ? orientation === 'PORTRAIT' ? IsIpad ? '50%' : '65%' : '40%' : orientation === 'PORTRAIT' ? '90%' : '50%'
    
    const backgroundColor = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(0)).current

    useEffect(() => {
        handleAnimated()
    }, [visibility])

    const handleAnimated = () => {
        Animated.parallel([
            Animated.timing(backgroundColor, {
                toValue: visibility ? 1 : 0,
                duration: duration,
                useNativeDriver: false
            }),
            Animated.timing(translateY, {
                toValue: visibility ? 1 : 0,
                duration: duration,
                useNativeDriver: false
            })
        ]).start()
    }

    const backgroundColorStyle = {
        backgroundColor: backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)'],
            extrapolate: 'clamp'
        })
    }
    
    const modalStyle = {
        transform: [
            {
                translateY: translateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [(height * 2), keyboard ? -100 : 0],
                    extrapolate: 'clamp'
                }) 
            },
            {
                scale: translateY.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [1, 1.5, 1],
                    extrapolate: 'clamp'
                })
            }
        ]
    }

    /* Nueva animación de fade */
    const fadeStyle = {
        opacity: backgroundColor,
        transform: [
            {
                translateY: translateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, keyboard ? -100 : 0],
                    extrapolate: 'clamp'
                }) 
            }
        ]
    } 

    return(
        <>
            <Animated.View
                pointerEvents={visibility ? 'auto' : 'none'}
                onTouchStart={dismissable ? () => handleDismiss() : () => {}}
                style={[styles.container, {width: '100%', height: '100%'}, backgroundColorStyle]} 
            />
            <Animated.View 
                pointerEvents={visibility ? 'auto' : 'none'}/* Tenemos que agregar esto para el estilo del fade */
                style={[styles.modal, {maxHeight: size === 's' ? 'auto' : (height - 200), width: maxWidth}, modalStyle]}>
                {
                    children
                }
            </Animated.View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        height: 'auto',
        position: 'absolute',
        zIndex: 10,
        overflow: 'hidden',
        borderRadius: 2
    }
})